const express = require('express')
const Tweet = require('../models/tweet')

// new router
const router = new express.Router()

const auth = require('../middleware/auth')

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