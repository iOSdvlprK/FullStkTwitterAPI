const express = require('express')
const User = require('../models/user')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')

// original router
const router = new express.Router()

// helpers

const upload = multer({
  limits: {
    fileSize: 100000000
  }
})

// endpoints

// create a new user
router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    res.status(201).send(user)
  }
  catch (e) {
    res.status(400).send(e)
  }
})

// fetch the users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({})
    res.send(users)
  }
  catch (e) {
    res.status(500).send(e)
  }
})

// login user routers
router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.send({ user, token })
  }
  catch (e) {
    res.status(500).send(e)
  }
})

// delete user route
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user) {
      return res.status(400).send()
    }
    
    res.send()
  }
  catch (e) {
    res.status(500).send(e)
  }
})

// fetch a single user
router.get('/users/:id', async (req, res) => {
  try {
    const _id = req.params.id
    const user = await User.findById(_id)
  
    if (!user) {
      return res.status(404).send()
    }
  
    res.send(user)
  }
  catch (e) {
    res.status(500).send(e)
  }
})

// post user profile image
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()

  if (req.user.avatar != null) {
    req.user.avatar = null
    req.user.avatarExists = false
  }

  req.user.avatar = buffer
  req.user.avatarExists = true
  await req.user.save()

  res.send(buffer)
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// fetch user profile image
router.get('/users/:id/avatar', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user || !user.avatar) {
      throw new Error("The user doesn't exist")
    }

    res.set('Content-Type', 'image/jpg')
    res.send(user.avatar)
  }
  catch (e) {
    res.status(404).send(e)
  }
})

// route for following
router.put('/users/:id/follow', auth, async (req, res) => {
  if (req.user.id != req.params.id) {
    try {
      const user = await User.findById(req.params.id)
      if (!user.followers.includes(req.user.id)) {
        await user.updateOne({ $push: { followers: req.user.id } })
        await req.user.updateOne({ $push: { followings: req.params.id } })
        res.status(200).json("user has been followed")
      }
      else {
        res.status(403).json('you already follow this user')
      }
    }
    catch (e) {
      res.status(500).json(e)
    }
  }
  else {
    res.status(403).json('you cannot follow yourself')
  }
})

// unfollow user
router.put('/users/:id/unfollow', auth, async (req, res) => {
  if (req.user.id != req.params.id) {
    try {
      const user = await User.findById(req.params.id)

      if (user.followers.includes(req.user.id)) {
        await user.updateOne({ $pull: { followers: req.user.id } })
        await req.user.updateOne({ $pull: { followings: req.params.id } })
        res.status(200).json('user has been unfollowed')
      }
      else {
        res.status(403).json("you don't follow this user")
      }
    }
    catch (e) {
      res.status(500).json(e)
    }
  }
  else {
    res.status(403).json('you cannot unfollow yourself')
  }
})

module.exports = router