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

  swapWord(list, nth){
    if(list.head === null){
      return;
    }
    let temp = list.head;
    let currentWord = list.head;
    let previousWord = null;
    let index = 0;
    while(index < nth && currentWord !== null) {
      previousWord = currentWord;
      currentWord = currentWord.next;
      index++;
    }
    if(previousWord === null){
      return;
    }
    list.head = list.head.next;
    previousWord.next = temp;
    previousWord.value.next = temp.value.id;
    temp.next = currentWord;
    temp.value.next = currentWord.value.id;
    

    return list;
  },

  generateLanguageList: async (db, listHead) => {
    const wordsLL = new LinkedList() 
    let headWord = await LanguageService.getWord(db, listHead)

    //linked list head
    let currWord = headWord
    let currID = listHead
    while(currWord !== null){
      console.log(currWord)
      wordsLL.insertLast(currWord);
      if(!currWord.next){
        currWord = null
      } else {
        currID = currWord.next
        currWord = await LanguageService.getWord(db, currID)
      }
    }
    return wordsLL
  },

  getList(list){
    const arr = []
    let curr = list.head
    while(curr !== null){
      arr.push(curr)
      curr = curr.next
    }
    return arr;
  },

  updateDatabase(db, wordsLL, language){
    return  db.transaction(async trx => {
      // const language = new Promise()
      const words = [];
      let currWord = wordsLL.head
      while(currWord !== null){
        words.push(currWord.value)
        currWord = currWord.next
      } 
        // console.log('list==================>', words)

      return Promise.all([
        trx('language')
          .update(language)
          .where('id', language.id)
        , 
        words.map(w => {
          return trx('word')
                    .update({...w})
                    .where('id', w.id)

        })])
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