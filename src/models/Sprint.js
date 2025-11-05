import mongoose from "mongoose";

const plannedStorySchema = new mongoose.Schema({
  score: { type: Number, required: true },
  quantity: { type: Number, required: true }
}, { _id: false });

const teamMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hours: { type: Number, default: 0 }
}, { _id: false });

const sprintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  plannedStories: { type: [plannedStorySchema], default: [] },
  plannedTotalPoints: { type: Number, default: 0 },
  usersAssigned: { type: [teamMemberSchema], default: [] },
  finalCompletionTotalPoints: { type: Number, default: 0 },
  finalObjectiveAchieved: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ["Planificado", "Activo", "Completado", "Completado-Éxito", "Completado-Parcial"],
    default: "Planificado"
  },
  observations: { type: String },
  // 👇 Añadimos estos dos campos para integrarlo con PointsRegistry
  userPoints: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      points: { type: Number, default: 0 }
    }
  ],
  completedPoints: { type: Number, default: 0 }
}, { timestamps: true });

// ✅ Calcular puntos planificados
sprintSchema.pre("save", function (next) {
  this.plannedTotalPoints = (this.plannedStories || []).reduce(
    (acc, p) => acc + (p.score * p.quantity),
    0
  );
  next();
});

// ✅ Actualización automática del estado según fechas y puntos
sprintSchema.pre("save", function (next) {
  const now = new Date();
  const start = new Date(this.startDate);
  const end = new Date(this.endDate);

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  const today = new Date(now.setHours(0, 0, 0, 0));

  if (today < start) {
    this.status = "Planificado";
  } else if (today >= start && today <= end) {
    this.status = "Activo";
  } else if (today > end) {
    const completionRate = this.finalCompletionTotalPoints / (this.plannedTotalPoints || 1);
    if (completionRate >= 0.8) {
      this.status = "Completado-Éxito";
      this.finalObjectiveAchieved = true;
    } else {
      this.status = "Completado-Parcial";
      this.finalObjectiveAchieved = false;
    }
  }
  next();
});

// ✅ Método estático para actualización diaria automática
sprintSchema.statics.updateSprintsStatus = async function () {
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));

  const sprints = await this.find({
    $or: [{ status: "Planificado" }, { status: "Activo" }]
  });

  for (const sprint of sprints) {
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    if (today < start) {
      sprint.status = "Planificado";
    } else if (today >= start && today <= end) {
      sprint.status = "Activo";
    } else if (today > end) {
      const completionRate = sprint.finalCompletionTotalPoints / (sprint.plannedTotalPoints || 1);
      if (completionRate >= 0.8) {
        sprint.status = "Completado-Éxito";
        sprint.finalObjectiveAchieved = true;
      } else {
        sprint.status = "Completado-Parcial";
        sprint.finalObjectiveAchieved = false;
      }
    }
    await sprint.save();
  }
};

export default mongoose.model("Sprint", sprintSchema);
