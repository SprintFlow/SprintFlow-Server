import mongoose from "mongoose";

const sprintSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  goal: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["planned", "in_progress", "finished"],
    default: "planned",
  },
  plannedPoints: {
    type: Number,
    default: 0,
  },
  realPoints: {
    type: Number,
    default: 0,
  },
  observations: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model("Sprint", sprintSchema);
