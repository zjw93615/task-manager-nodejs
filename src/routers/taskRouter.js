const express = require('express')
const Task = require('../models/task')
const Project = require('../models/project')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async (req, res) => {
    const match = {owner: req.user._id}
    const sort = {}

    if (req.query.completed) {
        match.isCompleted = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }else {
        sort.createdAt = -1
    }

    if (req.query.isTrashed) {
        match.isTrashed = req.query.isTrashed === 'true'
    }

    try {
        let tasks = await Task.find(match).limit(parseInt(req.query.limit)).skip(parseInt(req.query.skip)).sort(sort).populate('project')
        // await req.user.populate({
        //     path: 'tasks',
        //     match,
        //     options: {
        //         limit: parseInt(req.query.limit),
        //         skip: parseInt(req.query.skip),
        //         sort
        //     }
        // }).execPopulate()
        // tasks = await tasks.populate('project').execPopulate()
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        let task = await Task.findOne({ _id, owner: req.user._id })
        task = task.populate('project')
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async  (req, res) => {

    const allowedUpdate = ['title', 'description', 'isCompleted', 'isImportant', 'isStarred', 'isTrashed', 'project']

    try {
        const task = await Task.findOne( { _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        allowedUpdate.forEach((update) => {
            task[update] = req.body[update]
        })

        await task.save()

        res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    }catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router