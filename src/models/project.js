const mongoose = require('mongoose')
const Task = require('./task')

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: false,
        trim: true
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    isTrashed: {
        type: Boolean,
        default: false
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }]
}, {
    timestamps: true
})
projectSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'project'
})

projectSchema.pre('remove', async function (next) {
    const project = this
    await Task.deleteMany({project: project._id})
    next()
})


const Project = mongoose.model('Project', projectSchema)

module.exports = Project