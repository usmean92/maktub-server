import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

export const verifyToken = async (req, res, next) => {
  let authHeader = req.headers.authorization
  try {
    let token = authHeader.split(' ')[1];
    let verified = jwt.verify(token, process.env.JWT_KEY, (err, verifiedJwt) => {
      if (err) {
        return false
      } else {
        return (verifiedJwt)
      }
    })
    req.verified = verified
    next()
  } catch (err) {
    let error = new Error('You need to login first.')
    res.status(202).json({ status: false, error: error.message })
  }

}