const express = require('express')
const Project = require('../models/project')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/projects', auth, async (req, res) => {
    let members = []

    const project = new Project({
        ...req.body
    })

    try {
        await project.save()
        res.status(201).send(project)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/projects', auth, async (req, res) => {
    const match = {}
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
        const projects = await Project.find(match, null, {
            limit: parseInt(req.query.limit),
            skip: parseInt(req.query.skip),
            sort
        }).populate('members')
        res.send(projects)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/myProjects', auth, async (req, res) => {
    const match = {}
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
        await req.user.populate({
            path: 'projects',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.projects)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/projects/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const project = await Project.findById(_id)

        if (!project) {
            return res.status(404).send()
        }

        res.send(project)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/projects/:id', auth, async  (req, res) => {

    const allowedUpdate = ['title', 'description', 'isCompleted', 'isTrashed', 'members']

    try {
        const project = await Project.findById( req.params.id)

        if (!project) {
            return res.status(404).send()
        }

        allowedUpdate.forEach((update) => {
            project[update] = req.body[update]
        })

        await project.save()

        res.send(project)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/projects/:id', auth, async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id)
        if (!project) {
            return res.status(404).send()
        }
        res.send(project)
    }catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router