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

knex('notes')
  .where('id', 1012)
  .del()
  .then(res=>console.log(res));

  .leftJoin('notes_tags', 'notes.id', "notes_tags.notes_id")