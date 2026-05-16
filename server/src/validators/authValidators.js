import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("A valid email address is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export const loginSchema = z.object({
  email: z.string().trim().email("A valid email address is required."),
  password: z.string().min(1, "Password is required."),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("A valid email address is required."),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is required."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
