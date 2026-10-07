/** Fails fast at server start when the session secret is missing. */
export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Copy .env.example to .env.local and set it (openssl rand -base64 48).",
    );
  }
}
