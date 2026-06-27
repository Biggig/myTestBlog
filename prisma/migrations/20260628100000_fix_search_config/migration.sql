-- Fix: change full-text search config from 'english' to 'simple'
-- for Chinese text compatibility, and add JSON text extraction.

-- 1. Drop old trigger and function
DROP TRIGGER IF EXISTS post_search_trigger ON "Post";
DROP FUNCTION IF EXISTS update_post_search_vector();

-- 2. Create text extraction function for TipTap JSON content
-- TipTap stores content as JSON: {"type":"doc","content":[{"type":"text","text":"..."}]}
-- This function recursively extracts all ".text" values using SQL/JSON path queries.
CREATE OR REPLACE FUNCTION extract_tiptap_text(content TEXT) RETURNS TEXT AS $$
DECLARE
  content_json JSONB;
BEGIN
  IF content IS NULL OR content = '' THEN
    RETURN '';
  END IF;

  BEGIN
    content_json := content::JSONB;
  EXCEPTION WHEN OTHERS THEN
    -- Not valid JSON — return content as-is (plain text / legacy HTML)
    RETURN content;
  END;

  -- Recursively extract all ".text" key values from anywhere in the JSON tree
  RETURN (
    SELECT COALESCE(string_agg(value #>> '{}', ' '), '')
    FROM jsonb_path_query(
      content_json,
      'strict $.**.text'
    )
    WHERE jsonb_typeof(value) = 'string'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Re-create trigger function using 'simple' config and text extraction
CREATE OR REPLACE FUNCTION update_post_search_vector() RETURNS trigger AS $$
BEGIN
  NEW."searchVector" :=
    setweight(to_tsvector('simple', COALESCE(NEW."title", '')), 'A') ||
    setweight(to_tsvector('simple', extract_tiptap_text(NEW."content")), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create trigger
CREATE TRIGGER post_search_trigger
  BEFORE INSERT OR UPDATE ON "Post"
  FOR EACH ROW EXECUTE FUNCTION update_post_search_vector();

-- 5. Rebuild search vectors for existing posts
UPDATE "Post"
SET "searchVector" =
  setweight(to_tsvector('simple', COALESCE("title", '')), 'A') ||
  setweight(to_tsvector('simple', extract_tiptap_text("content")), 'B');
