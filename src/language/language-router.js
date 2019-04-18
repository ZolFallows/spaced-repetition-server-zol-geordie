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
    const guess = req.body.guess

    if(!guess){
      res.status(400).json({error: `Missing 'guess' in request body`})
    }

    try{
      const list = await LanguageService.generateLanguageList(
        req.app.get('db'),
        req.language
      )
      
      const head = list.head
      if(head.value.translation === guess){
        const newMV = head.value.memory_value*2
        const nextId = head.next.value.id 
        head.value.correct_count+=1
        req.language.total_score+=1
        head.value.memory_value = newMV
        req.language.head = nextId

        const tempValue = await list.remove(head.value)
        await list.insertAt(tempValue, newMV)

        await LanguageService.updateDatabase(
          req.app.get('db'),
          list,
          req.language
          )

        res.status(200).json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: list.head.value.translation,
          isCorrect: true
        })

      } else if(head.value.translation !== guess){
        // const temp = head.value
        const nextId = head.next.value.id 
        head.value.incorrect_count+=1
        head.value.memory_value=1
        req.language.head = nextId
        list.head = list.head.next

        const tempValue = await list.remove(head.value)
        await list.insertAt(tempValue, 1)

        await LanguageService.updateDatabase(
          req.app.get('db'),
          list,
          req.language
          )

        res.status(200).json({
          nextWord: list.head.value.original,
          totalScore: req.language.total_score,
          wordCorrectCount: list.head.value.correct_count,
          wordIncorrectCount: list.head.value.incorrect_count,
          answer: list.head.value.translation,
          isCorrect: false
        })
      }


      
    } catch(error){
      next(error)
    }




    res.send('implement me!')
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