import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sprint",
        default: null,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
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

export default mongoose.model("Story", storySchema)