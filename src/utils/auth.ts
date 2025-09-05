import jwt, { SignOptions } from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET: string = process.env.JWT_SECRET || "changeme";

export interface JWTPayload {
  id: string; 
  email: string;
  role?: "admin" | "candidate"; // so same utils work for both
}

// ✅ Sign a JWT
export function generateToken(
  payload: JWTPayload,
  expiresIn: SignOptions["expiresIn"] = "7d"
): string {
  const options: SignOptions = { expiresIn };
  return jwt.sign(payload, JWT_SECRET as jwt.Secret, options);
}

// ✅ Verify JWT
export function verifyToken<T = any>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as T;
  } catch {
    return null;
  }
}

// ✅ Extract bearer token
export function getAuthToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  if (!authHeader.startsWith("Bearer ")) return null;
  return authHeader.split(" ")[1];
}

// ✅ Role-based guards
export function requireAdmin(authHeader: string | null): JWTPayload | null {
  const token = getAuthToken(authHeader);
  if (!token) return null;
  const decoded = verifyToken<JWTPayload>(token);
  if (!decoded || decoded.role !== "admin") return null;
  return decoded;
}

export function requireCandidate(authHeader: string | null): JWTPayload | null {
  const token = getAuthToken(authHeader);
  if (!token) return null;
  const decoded = verifyToken<JWTPayload>(token);
  if (!decoded || decoded.role !== "candidate") return null;
  return decoded;
}
