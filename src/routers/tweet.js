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

module.exports = router