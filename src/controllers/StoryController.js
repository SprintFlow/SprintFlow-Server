import StoryModel from "../models/StoryModel.js"

// POST - create story
export const createStory = async (req, res) => {
    try {
        const { title, points, sprintId, userId } = req.body

        if (!title || points == null) {
            return res.status(400).json({ message: "Title y points son obligatorios "})
        }

        const story = await StoryModel.create({ title, points, sprintId, userId})
        res.status(201).json(story)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// GET - stories
export const getStories= async (req, res) => {
    try {
        const stories = await StoryModel.find().populate("userId sprintId")
        res.json(stories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
} 

//GET/:id - list one story
export const getOneStory = async (req, res) => {
    try {
        const { id } = req.params
        const story = await StoryModel.findById(id).populate("userId sprintId")

        if(!story) return res.status(404).json({ message: "Historia no encontrada"})

        res.json(story)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// GET/sprint/:sprintId/stories - list by sprint
export const getStoriesBySprint = async (req, res) => {
    try {
        const { sprintId } = req.params
        const stories = await Story.find({ sprintId }).populate("userId sprintId")
        res.json(stories)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// PUT/:id - story
export const updateStory = async (req, res) => {
    try {
        const { id } = req.params
        const { title, points, status } = req.body

        const story = await StoryModel.findByIdAndUpdate(
            id, { title, points, status },
            { new: true, runValidators: true } //?
        )

        if (!story) return res.status(404).json({ message: "Story no encontrada "})
        res.json(story)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// PUT real points
export const updateStoryPoints = async (req, res) => {
    try {
        const { id } = req.params
        const { points } = req.body

        if (points == null || points < 0) {
            return res.status(400).json({ message: "Points inválidos" })
        }

        const story = await StoryModel.findByIdAndUpdate(id, { points }, { new: true, runValidators: true })
        if (!story) return res.status(404).json({ message: "Story no encontrada" })

        res.json(story)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// DELETE/:id - story
export const deleteStory = async (req, res) => {
    try {
        const { id } = req.params
        const story = await StoryModel.findByIdAndDelete(id)
        if (!story) return res.status(404).json({ message: "Story no encontrada" })
        res.json({ message: "Story eliminada correctamente" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}