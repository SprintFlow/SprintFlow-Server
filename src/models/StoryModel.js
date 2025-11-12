import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sprints",
        default: null,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        default: null,
    },
    points: {
        type: Number,
        required: true,
        min: 0,
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "done"],
        default: "pending",
    },
}, { timestamps: true })

export default mongoose.model("Stories", storySchema)