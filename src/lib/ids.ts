import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/** Unique, hard-to-guess complaint ID, e.g. RH-26-K7M2QX */
export function generateTicketId(date = new Date()) {
  const bytes = randomBytes(6);
  let code = "";
  for (const b of bytes) code += ALPHABET[b % ALPHABET.length];
  return `RH-${String(date.getFullYear()).slice(-2)}-${code}`;
}
