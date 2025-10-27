import mongoose from "mongoose";

const completedStorySchema = new mongoose.Schema({
  score: { type: Number, required: true },
  quantity: { type: Number, default: 0 }
}, { _id: false });

const completionSchema = new mongoose.Schema({
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  completedStories: { type: [completedStorySchema], default: [] },
  totalCompletedPoints: { type: Number, default: 0 },

  interruptions: { type: Array, default: [] },
  notes: { type: String },

  submissionDate: { type: Date, default: Date.now }
}, { timestamps: true });

completionSchema.index({ sprintId: 1, userId: 1 }, { unique: true });

completionSchema.pre("save", function (next) {
  this.totalCompletedPoints = (this.completedStories || []).reduce(
    (acc, e) => acc + e.score * e.quantity,
    0
  );
  next();
});

export default mongoose.model("Completion", completionSchema);
