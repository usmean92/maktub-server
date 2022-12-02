import express from 'express';
import { getQuizes, getQuiz, getUserQuizes, createQuiz, updateQuiz, courseQuiz } from '../controller/quiz.js'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router();
router.get('/', getQuizes)
router.use(verifyToken)
router.get('/quiz/:qid', getQuiz)
router.get('/quizes', getUserQuizes)
router.post('/create', createQuiz)
router.post('/update/:qid', updateQuiz)
router.post('/course', courseQuiz)

export default router;