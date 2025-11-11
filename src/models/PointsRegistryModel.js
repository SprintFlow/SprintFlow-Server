import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  pointValue: { type: Number, required: true },
  count: { type: Number, required: true, min: 1 },
  subtotal: { type: Number, required: true }
}, { _id: false });

const pointsRegistrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  sprintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sprint",
    required: true
  },
  stories: { type: [storySchema], default: [] },
  totalPoints: { type: Number, required: true, min: 0 },
  isInterruption: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// ✅ Índices para mejorar rendimiento de consultas
pointsRegistrySchema.index({ userId: 1, sprintId: 1 });
pointsRegistrySchema.index({ sprintId: 1 });

export default mongoose.model("PointsRegistry", pointsRegistrySchema);
