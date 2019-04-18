const LinkedList = require('./linked-list');

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first()
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id })
  },

  getNextWord(db, language_id, head){
    return db
      .from('word')
      .select(
        'word.original',
        'word.correct_count',
        'word.incorrect_count',
        'lang.total_score'
      )
      .leftJoin('language AS lang', 'word.language_id', 'lang.id')
      .where({ language_id, 'word.id': head})
      .first();
  },

  getWord(db, id){
    return db
      .from('word')
      .select('*')
      .where({id})
      .first()
  },

  generateLanguageList: async (db, listHead) => {
    const wordsLL = new LinkedList() 
    let headWord = await LanguageService.getWord(db, listHead)

    //linked list head
    let currWord = headWord
    let currID = listHead
    while(currWord !== null){
      wordsLL.insertLast(currWord);
      if(currWord.next === null){
        currWord = null
      } else {
        currID = currWord.next
        currWord = await LanguageService.getWord(db, currID)
      }
    }
    return wordsLL
  },

  updateDatabase(db, wordsLL, language){
    return  db.transaction(async trx => {
      // const language = new Promise()
      const updatedLang = await trx('language')
        .update(language)
        .where({id: language.id})

      const words = [];
      let currWord = wordsLL.head
      while(currWord !== null){
        let word = await trx('word')
          .update(currWord.value)
          .where({id: currWord.value.id})

        words.push(word)
        currWord = currWord.next
      } 

      return Promise.all([updatedLang, words])
    })
  }

}

module.exports = LanguageService


/*
Write appropriate service object method(s) to get the following details:
      The next word (original) the user needs to submit their answer for.
      The correct count for that word.
      The incorrect count for that word.
      The total score for the user so far.

{
  "nextWord": "Testnextword",
  "wordCorrectCount": 222,
  "wordIncorrectCount": 333,
  "totalScore": 999
}
*/