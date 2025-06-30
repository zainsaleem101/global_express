export interface User {
  id: string;
  name: string;
  email: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

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