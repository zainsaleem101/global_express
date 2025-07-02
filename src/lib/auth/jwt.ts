import jwt from "jsonwebtoken";

// Environment variables should be set in .env.local file
const JWT_SECRET = process.env.JWT_SECRET || "your-very-secure-secret-key"; // Default for development
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // Default expiry of 7 days

export interface UserPayload {
  id: string;
  email: string;
  name: string;
}

export interface TokenVerificationResult {
  valid: boolean;
  user?: UserPayload;
  error?: string;
  expired?: boolean;
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
 * Verify a JWT token and return detailed result
 */
export function verifyTokenWithDetails(token: string): TokenVerificationResult {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return {
      valid: true,
      user: decoded,
    };
  } catch (error: any) {
    // Only log in development environment
    if (process.env.NODE_ENV === "development") {
      console.error("Token verification failed:", error);
    }

    return {
      valid: false,
      error: error.message,
      expired: error.name === "TokenExpiredError",
    };
  }
}
