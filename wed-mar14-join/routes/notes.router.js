'use strict';

const knex = require('../knex');

const express = require('express');
const hydrateNotes = require('../utils/hydrateNotes');


// Create an router instance (aka "mini-app")
const router = express.Router();

// TEMP: Simple In-Memory Database
/* 
const data = require('../db/notes');
const simDB = require('../db/simDB');
const notes = simDB.initialize(data);
*/

// Get All (and search by query)
/* ========== GET/READ ALL NOTES ========== */
router.get('/notes', (req, res, next) => {
  const { searchTerm, folderId, tagId } = req.query;
  knex.select('notes.id', 'notes.title', 'notes.content', 
    'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
    .modify(function (queryBuilder) {
      if (searchTerm) {
        queryBuilder.where('title', 'like', `%${searchTerm}%`);
      }
    })
    .modify(function (queryBuilder) {
      if (folderId) {
        queryBuilder.where('folder_id', folderId);
      }
    })
    .modify(function (queryBuilder) {
      if (tagId) {
        queryBuilder.where('tag_id', tagId);
      }
    })
    .orderBy('notes.id')
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
  
    .catch(err => next(err));
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  
  let query = knex.select('notes.id', 'notes.title', 'notes.content', 
    'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
    .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
    .leftJoin('tags', 'notes_tags.tag_id', 'tags.id');
    
  if(noteId) query = query.where('notes.id', noteId);
  

  query.then(([item]) => {
    res.json(item);
  })
    .catch(err=>next(err));
});
//simplified/dry version^




/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content', 'folder_id'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update({title: `${updateObj.title}`, content: `${updateObj.content}`, 
      folder_id:`${updateObj.folder_id}`})  
    .where(function(){
      if(noteId){
        this.where('id', noteId);
      }
    })
    //.returning('id')
    .then(()=>{//delete tags from current note
      return knex('notes_tags').where('note_id', noteId).del();
    })
    .then(//reinsert new related tags
      ()=>{
        const tags = req.body.tags;
        const tagsToInsert= tags.map(tag=>({note_id: noteId, tag_id: tag}));
        return knex('notes_tags').insert(tagsToInsert);
      }
    )
    .then(() =>{
      return knex.select('notes.id', 'notes.title', 'notes.content', 
        'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
  
    .catch(err => {console.error(err); res.sendStatus(500);});
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id, tags=[]} = req.body; // Add `folder_id`
  /*
  REMOVED FOR BREVITY
  */
  const newItem = {
    title: title,
    content: content,
    folder_id: folder_id,  // Add `folder_id`
  };

  let noteId;
  // Insert new note into notes table
  knex.insert(newItem).into('notes').returning('id')
    .then(([id]) => {
    // Insert related tags into notes_tags table
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
    // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
      // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});


/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/notes/:id', (req, res, next) => {
  const id = req.params.id;
  
  /*
  notes.delete(id)
    .then(count => {
      if (count) {
        res.status(204).end();
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */
  knex('notes')
    .where('id', `${id}`)
    .del()
    .then(deleted => res.status(204).end());
});

module.exports = router;