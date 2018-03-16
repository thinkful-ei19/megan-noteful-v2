'use strict';

const knex = require('../knex');

//knex('notes').select().then(result=> console.log(result));

// knex('notes')
//   .select('id', 'title', 'content')
//   .where('title', 'like', `%cat%`)
//   .then(res=> console.log(res));

// knex('notes')
//   .select()
//   .where('id', `${noteId}`)
//   .then(res=> console.log(res));

// knex('notes')
//   .where('id', 1000)
//   .update({title: 'Hi', content: 'Hello'})
//   .then(res=>console.log(res));

// knex('notes')
//   .insert({title : 'pop', content :'testing'})
//   .then(console.log);

// knex('notes').select()
//   .where('title', 'like', '%not a valid search%')
//   .then(res=>console.log(res));

const newItem = {content :'testing', folder_id: null};

knex('notes')
  .insert(newItem)
  .then(console.log);