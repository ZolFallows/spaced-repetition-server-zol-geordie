const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('../../Data-Structure/LinkedList')

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
    const {guess} = req.body

    if(!guess){
      res.status(400).json({error: `Missing 'guess' in request body`})
    }


    try{
      const list = await LanguageService.generateLanguageList(
        req.app.get('db'),
        req.language.head
      )

      // console.log(await LanguageService.getList(list))

      const head = list.head

      if(head.value.translation === guess){
        const newMV = head.value.memory_value*2
        const nextId = head.next.value.id 
        req.language.head = nextId
        req.language.total_score++
        head.value.correct_count++
        head.value.memory_value = newMV
        // console.log('mv==================>', newMV)
        await LanguageService.swapWord(list, newMV)
        // console.log(list.head)

        await LanguageService.updateDatabase(
          req.app.get('db'),
          list,
          req.language
          )
        

        res.json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: list.head.value.translation,
          isCorrect: true
        })

      } else {
        // const temp = head.value
        const nextId = head.next.value.id 
        req.language.head = nextId
        head.value.incorrect_count++
        head.value.memory_value = 1
        list.head = list.head.next
      
        await LanguageService.swapWord(list, head.value.memory_value)
        
        console.log(list.head)
        await LanguageService.updateDatabase(
          req.app.get('db'),
          list,
          req.language
          )

        res.json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: list.head.value.translation,
          isCorrect: false
        })
      }
      next()
    } catch(error){
      next(error)
    }
  })

module.exports = languageRouter
/*
# Learning page - 1
## User story:

As a logged in user, I can learn words using spaced repetition

## Acceptance criteria:

When viewing the learning page as a logged in user:

- The app gets my next word to learn details from the server
- I'm shown the word to learn
- I'm shown my current total score
- I'm shown the number of correct and incorrect guesses for that word
- I'm presented an input to type my answer/guess for the current words translation

*/