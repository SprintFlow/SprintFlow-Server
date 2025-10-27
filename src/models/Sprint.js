import mongoose from "mongoose";

const plannedStorySchema = new mongoose.Schema({
  score: { type: Number, required: true }, // e.g. 0.5,1,2,3,5,8...
  count: { type: Number, required: true }
}, { _id: false });

const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  hours: { type: Number, default: 0 } // opcional
}, { _id: false });

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  plannedPoints: { type: [plannedStorySchema], default: [] },
  totalPlannedPoints: { type: Number, default: 0 },

  goal: { type: String, required: true },
  isObjectiveCompleted: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["planned", "active", "finished"],
    default: "planned",
  },

  teamMembers: { type: [teamMemberSchema], default: [] },

  observations: { type: String },
}, { timestamps: true });

// pre-save para calcular totalPlannedPoints
sprintSchema.pre("save", function (next) {
  this.totalPlannedPoints = (this.plannedPoints || []).reduce(
    (acc, p) => acc + (p.score * p.count),
    0
  );
  next();
});

export default mongoose.model("Sprints", sprintSchema);
