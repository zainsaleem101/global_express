import jwt from "jsonwebtoken";

// Environment variables should be set in .env.local file
const JWT_SECRET = process.env.JWT_SECRET || "your-very-secure-secret-key"; // Default for development
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // Default expiry of 7 days

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

/**
 * Generate a JWT token for the user
 */
export function generateToken(user: UserPayload): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

/**
 * Verify a JWT token and return the decoded data
 */
export function verifyToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * Parse the Authorization header and extract the token
 */
export function extractTokenFromHeader(
  authHeader: string | null
): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove 'Bearer ' prefix
}
