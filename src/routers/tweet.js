const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Tweet = require('../models/tweet')

// new router
const router = new express.Router()

const auth = require('../middleware/auth')

// helper functions
const upload = multer({
  limits: {
    fileSize: 100000000
  }
})

// post tweet router
router.post('/tweets', auth, async (req, res) => {
  const tweet = new Tweet({
    ...req.body,
    user: req.user._id
  })

  try {
    await tweet.save()
    res.status(201).send(tweet)
  }
  catch (err) {
    res.status(400).send(err)
  }
})

// add image to tweet route
router.post('/uploadTweetImage/:id', auth, upload.single('upload'), async (req, res) => {
  const tweet = await Tweet.findOne({ _id: req.params.id })
  console.log(tweet)

  if (!tweet) {
    throw new Error('Cannot find the tweet')
  }

  const buffer = await sharp(req.file.buffer).resize({width: 350, height: 350}).png().toBuffer()
  tweet.image = buffer
  await tweet.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({ error: error.message })
})

// fetch all tweets
router.get('/tweets', async (req, res) => {
  try {
    const tweets = await Tweet.find({})
    res.send(tweets)
  }
  catch (err) {
    res.status(500).send(err)
  }
})

module.exports = router