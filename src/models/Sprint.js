import mongoose from "mongoose";

const plannedStorySchema = new mongoose.Schema({
  score: { type: Number, required: true }, // e.g. 0.5, 1, 2, 3, 5, 8
  quantity: { type: Number, required: true }
}, { _id: false });

const teamMemberSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
  hours: { type: Number, default: 0 } // opcional

}, { _id: false });

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },

  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  plannedStories: { type: [plannedStorySchema], default: [] },
  plannedTotalPoints: { type: Number, default: 0 },

  usersAssigned: { type: [teamMemberSchema], default: [] },

  finalCompletionTotalPoints: { type: Number, default: 0 },
  finalObjectiveAchieved: { type: Boolean, default: false },

  status: {
    type: String,
    enum: ["Planificado", "Activo", "Completado"],
    default: "Planificado"
  },

  observations: { type: String }
}, { timestamps: true });

sprintSchema.pre("save", function (next) {
  this.plannedTotalPoints = (this.plannedStories || []).reduce(
    (acc, p) => acc + (p.score * p.quantity),
    0
  );
  next();
});

export default mongoose.model("Sprints", sprintSchema);
