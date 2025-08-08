import mongoose, { Schema, models, model } from "mongoose";

const OtpTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: { type: String, enum: ["SIGNUP", "FORGOT_PASSWORD"], required: true },
    expiresAt: { type: Date, required: true },
    consumedAt: { type: Date },
  },
  { timestamps: true }
);

OtpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpTokenDocument = mongoose.InferSchemaType<typeof OtpTokenSchema> & { _id: mongoose.Types.ObjectId };

export const OtpTokenModel = models.OtpToken || model("OtpToken", OtpTokenSchema);