const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')


const bodyParser = express.json()
const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    try{
      const word = await LanguageService.getNextWord(
        req.app.get('db'),
        req.language.id,
        req.language.head
      )
      
      res.json({
        nextWord: word.original,
        totalScore: word.total_score,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count,
      })

      next()
    } catch (error) {
      next(error)
    }

  })

languageRouter
  .post('/guess', bodyParser, async (req, res, next) => {
    const { guess } = req.body

    if (!guess){
      return res.status(400).json({error: `Missing 'guess' in request body`})
    }


    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      const list = LanguageService.populateList(
        req.language,
        words,
      )

      const word = list.head
      let isCorrect = word.value.translation.toLowerCase() === guess.toLowerCase()

      if (isCorrect) {
        list.total_score++
        list.head.value.correct_count++
        list.head.value.memory_value = word.value.memory_value*2
      } else {
        list.head.value.incorrect_count++
        list.head.value.memory_value=1
      }

      await list.shiftHead(list.head.value.memory_value);
      await LanguageService.persistUpdate(
        req.app.get('db'),
        list,
      )

      res.json({
        nextWord: list.head.value.original,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        totalScore: list.total_score,
        answer: word.value.translation,
        isCorrect,
      })
    } catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
