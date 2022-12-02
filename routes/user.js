import express from 'express';
import { signup, login, forgotPassword, resetPassword, getUser } from '../controller/user.js'

const router = express.Router();

router.get('/', getUser)
router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

export default router;