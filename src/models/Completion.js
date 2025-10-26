import mongoose from 'mongoose';

const completionEntrySchema = new mongoose.Schema({
  score: { type: Number, required: true },
  completedCount: { type: Number, default: 0 }
}, { _id: false });

const completionSchema = new mongoose.Schema({
  sprintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sprint', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completedStories: { type: [completionEntrySchema], default: [] },
  totalAchievedPoints: { type: Number, default: 0 },
  notes: { type: String }
}, { timestamps: true });

// índice único por sprint+user
completionSchema.index({ sprintId: 1, userId: 1 }, { unique: true });

completionSchema.pre("save", function(next) {
  this.totalAchievedPoints = (this.completedStories || []).reduce(
    (acc, e) => acc + e.score * e.completedCount,
    0
  );
  next();
});

export default mongoose.model('Completion', completionSchema);
