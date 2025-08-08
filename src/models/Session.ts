import mongoose, { Schema, models, model } from "mongoose";

const SessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDocument = mongoose.InferSchemaType<typeof SessionSchema> & { _id: mongoose.Types.ObjectId };

export const SessionModel = models.Session || model("Session", SessionSchema);