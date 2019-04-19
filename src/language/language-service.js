const {LinkedList, _Node} = require('./linked-list');

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

  
  populateList(language, words) {
    const list = new LinkedList({
      id: language.id,
      name: language.name,
      total_score: language.total_score,
    })
    let word = words.find(w => w.id === language.head)
    list.insertHead(word)
    
    for(let i=0; i<words.length; i++){
      if(word.next){
        word = words.find(w => w.id === word.next)
        list.insert(word)
      }
    }
    return list
  },

  // updateLanguage(db, list){
  //   return db('language')
  //     .where('id', list.id)
  //     .update({
  //       total_score: list.total_score,
  //       head: list.head.value.id,
  //   })
  // },


  // updateWords(db, list){
  //   const 
  //   return list.map(w => 
  //     db('word')
  //     .where('id', w.value.id)
  //     .update({
  //       memory_value: w.value.memory_value,
  //       correct_count: w.value.correct_count,
  //       incorrect_count: w.value.incorrect_count,
  //       next: w.next ? w.next.value.id : null,
  //     }))
  // },
  
  persistUpdate(db, list) {
    const promiseRes = []

    promiseRes.push(
      db('language')
      .where('id', list.id)
      .update({
        total_score: list.total_score,
        head: list.head.value.id,
    }))

    list.map(w => {
      promiseRes.push(
         db('word')
          .where('id', w.value.id)
          .update({
            memory_value: w.value.memory_value,
            correct_count: w.value.correct_count,
            incorrect_count: w.value.incorrect_count,
            next: w.next ? w.next.value.id : null,
          })
      )
    })
    return Promise.all(promiseRes)
  }
}


module.exports = LanguageService

