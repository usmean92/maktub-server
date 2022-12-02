import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: { type: String, required: true },
  password: {
    type: String,
    required: true
  },
  expires: {
    type: String
  }

})

UserSchema.pre('save', async function (next) {
  const user = this
  const hash = await bcrypt.hash(user.password, 10)
  user.password = hash
})

UserSchema.methods.isValidPassword = async function (password) {
  const user = this
  console.log('uu: ', user)
  const compare = await bcrypt.compare(password, user.password)
  return compare
}
const UserModel = mongoose.model('user', UserSchema, 'Users')

export default UserModel