const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Invalid email')
      }
    }
  },
  password: {
    type: String,
    required: true,
    minLength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('Password cannot contain "password"')
      }
    }
  },
  avatar: {
    type: Buffer
  },
  avatarExists: {
    type: Boolean
  },
  bio: {
    type: String
  },
  website: {
    type: String
  },
  location: {
    type: String
  },
  followers: {
    type: Array,
    default: []
  },
  followings: {
    type: Array,
    default: []
  }
})

// relationship between tweets and user
userSchema.virtual('tweets', {
  ref: 'Tweet',
  localField: '_id',
  foreignField: 'user'
})

// to delete password prior to GET
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  delete userObject.password

  return userObject
}

// to hash the password
userSchema.pre('save', async function () {
  const user = this

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }

  // next()
})

const User = mongoose.model('User', userSchema)
module.exports = User
