import { createHash } from "crypto";

export function getGravatarUrl(email: string | null | undefined): string | undefined {
  if (!email) return undefined;
  const hash = createHash("md5").update(email.trim().toLowerCase()).digest("hex");
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=80`;
}
