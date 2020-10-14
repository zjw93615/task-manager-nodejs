const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendResetPassword } = require('../emails/account')
const crypto = require('crypto');
const router = new express.Router()

router.post('/users/register', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()
        sendWelcomeEmail(user.email, user.displayName)
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    }catch (e) {
        res.status(400).send(e.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    }catch (e) {
        res.status(500).send(e.message)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()

        res.send()
    }catch (e) {
        res.status(500).send(e.message)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async  (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdate = ['displayName', 'email', 'password']
    const isValidOperation = updates.every((update) => {
        return allowedUpdate.includes(update)
    })

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update]
        })
        await req.user.save()
        res.send(req.user)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()

        res.send(req.user)
    }catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users', auth, async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/forgot', async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        const buf = crypto.randomBytes(32)
        const token = buf.toString('hex')
        user.resetPasswordToken = token
        user.resetPasswordExpires = Date.now() + 7200000 // 2 hour
        await user.save()
        sendResetPassword(user.email, 'http://localhost:8080/pages/reset-password?token=' + token)
        res.send(user)
    }catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/reset', async (req, res) => {
    try {
        const user = await User.findOne({resetPasswordToken: req.body.token})
        user['password'] = req.body.password
        await user.save()
        res.send(user)
    }catch (e) {
        res.status(500).send(e)
    }
})

// router.get('/users/:id', auth, async (req, res) => {
//     const _id = req.params.id
//
//     try {
//         const user = await User.findById(_id)
//
//         if (!user) {
//             return res.status(404).send()
//         }
//
//         res.send(user)
//     } catch (e) {
//         res.status(500).send()
//     }
// })

// router.patch('/users/:id', auth, async  (req, res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdate = ['displayName', 'email', 'password']
//     const isValidOperation = updates.every((update) => {
//         return allowedUpdate.includes(update)
//     })
//
//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' });
//     }
//
//     try {
//         const user = await User.findById(req.params.id)
//
//         updates.forEach((update) => {
//             user[update] = req.body[update]
//         })
//
//         await user.save()
//
//         if (!user) {
//             return res.status(404).send()
//         }
//
//         res.send(user)
//     }catch (e) {
//         res.status(400).send(e)
//     }
// })

// router.delete('/users/:id', auth, async (req, res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user) {
//             return res.status(404).send()
//         }
//
//         res.send(user)
//     }catch (e) {
//         res.status(400).send(e)
//     }
// })

module.exports = router