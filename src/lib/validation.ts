import { z } from "zod";
import { UserRole } from "@/types";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  role: z.nativeEnum(UserRole),
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  purpose: z.enum(["SIGNUP", "FORGOT_PASSWORD"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
  newPassword: z.string().min(8),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  avatarBase64: z.string().optional(),
});