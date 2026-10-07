import { type JWTPayload, jwtVerify, SignJWT } from "jose";

/**
 * Signed session token, shared by `proxy.ts` (optimistic gate) and the server
 * data layer (authoritative gate). Never import this from client code.
 */
export const SESSION_COOKIE = "legba_session";

const ISSUER = "legba-dashboard";
const AUDIENCE = "app.legba.xyz";

export type SessionClaims = JWTPayload & {
  sub: string;
  name: string;
  email: string;
  iat: number;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET is missing or shorter than 32 characters. Copy .env.example to .env.local and set it.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(
  user: { id: string; name: string; email: string },
  ttlSeconds: number,
) {
  return await new SignJWT({ name: user.name, email: user.email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ttlSeconds}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    const valid =
      typeof payload.sub === "string" &&
      typeof payload.name === "string" &&
      typeof payload.email === "string" &&
      typeof payload.iat === "number";
    return valid ? (payload as SessionClaims) : null;
  } catch {
    // An expired, forged, or malformed token is simply "no session".
    return null;
  }
}
