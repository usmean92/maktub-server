import config from 'config';
import QuizModel from '../models/quiz.js'
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config()

export const getQuizes = async (req, res) => {
  let quizes = await QuizModel.find({})
  res.status(202).json({ message: true, quizes });
}

export const getQuiz = async (req, res) => {
  let quiz = await QuizModel.find({ _id: req.params.qid }).populate('user')
  if (quiz.length) {
    return res.status(202).json({ message: true, quiz });
  }
  return res.status(202).json({ message: false, error: 'No quiz found' });

}

export const getUserQuizes = async (req, res) => {

  let quizes = await QuizModel.find({ user: req.verified.user.id }).populate('user')
  if (quizes.length) {
    return res.status(202).json({ message: true, quizes });
  }
  return res.status(202).json({ message: false, error: 'No quizes found' });
}

export const createQuiz = async (req, res) => {
  let results = [], status = []
  let { course } = req.body;

  for (var i = 0; i < course.items; i++) {
    results[i] = null
    status[i] = 'unattemped'
  }

  let quiz = await QuizModel.find({ course: course.title, user: req.verified.id })
  if (quiz.length) {
    return res.status(202).json({ message: false, error: 'Quiz already created' });
  }
  quiz = await QuizModel.create({ course: course.title, user: req.verified.id, status, results })
  return res.status(202).json({ message: true, quiz });
}

export const updateQuiz = async (req, res) => {
  let { index } = req.body
  try {
    let quiz = await QuizModel.findById({
      _id: req.params.qid
    })
    if (!quiz) res.status(202).json({ message: false, error: 'Quiz not found' });
    let { results, status } = quiz
    results[index] = 'pass'
    status[index] = 'completed'
    quiz = await QuizModel.findByIdAndUpdate({
      _id: req.params.qid
    }, { status, results }, { new: true })
    res.status(202).json({ message: true, quiz });
  } catch (err) {
    res.status(202).json({ message: false, error: 'err.message' });
  }
}

export const courseQuiz = async (req, res) => {
  let { title } = req.body
  let quizes = await QuizModel.find({ course: title, user: req.verified.id })
  if (quizes.length) {
    return res.status(202).json({ message: true, quizes });
  }

  return res.status(202).json({ message: false, error: 'No Quiz found' });
}