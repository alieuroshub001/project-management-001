export enum UserRole {
  ADMIN = "ADMIN",
  TEAM = "TEAM",
  HR = "HR",
  CLIENT = "CLIENT",
}

export type BaseDocument = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Email = string;
export type ObjectIdString = string;

export type UserProfile = {
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  department?: string | null;
};

export type User = BaseDocument & {
  email: Email;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  profile?: UserProfile;
};

export type OtpPurpose = "SIGNUP" | "FORGOT_PASSWORD";

export type OtpToken = BaseDocument & {
  userId: ObjectIdString;
  email: Email;
  code: string;
  purpose: OtpPurpose;
  expiresAt: Date;
  consumedAt?: Date | null;
};

export type AuthSession = BaseDocument & {
  userId: ObjectIdString;
  userAgent?: string | null;
  ip?: string | null;
  active: boolean;
  expiresAt: Date;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
  code?: string;
  issues?: unknown;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type JwtPayload = {
  sub: string;
  role: UserRole;
  email: Email;
  sessionId: string;
  iat: number;
  exp: number;
};