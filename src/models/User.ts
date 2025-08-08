import mongoose, { Schema, models, model } from "mongoose";
import { UserRole } from "@/types";

const UserProfileSchema = new Schema(
  {
    fullName: { type: String, required: true },
    avatarUrl: { type: String },
    phone: { type: String },
    department: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(UserRole), required: true, index: true },
    isVerified: { type: Boolean, default: false },
    profile: { type: UserProfileSchema },
  },
  { timestamps: true }
);

export type UserDocument = mongoose.InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };

export const UserModel = models.User || model("User", UserSchema);