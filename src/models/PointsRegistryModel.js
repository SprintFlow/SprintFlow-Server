import mongoose from 'mongoose';

const pointsRegistrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sprintId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sprint',
        required: true
    },
    stories: [{
        pointValue: {
            type: Number,
            required: true
        },
        count: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    totalPoints: {
        type: Number,
        required: true,
        min: 0
    },
    isInterruption: {
        type: Boolean,
        default: false
    },
    registeredAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para búsquedas rápidas
pointsRegistrySchema.index({ userId: 1, sprintId: 1 });
pointsRegistrySchema.index({ sprintId: 1 });

const PointsRegistry = mongoose.model('PointsRegistry', pointsRegistrySchema);

export default PointsRegistry;