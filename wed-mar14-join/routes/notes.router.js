'use strict';

const knex = require('../knex');

const express = require('express');

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
  const { searchTerm, folderId } = req.query;
  knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id')
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
    .orderBy('notes.id')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  
  let query = knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName')
    .from('notes')
    .leftJoin('folders', 'notes.folder_id', 'folders.id');
    
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

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  knex('notes')
    .update({title: `${updateObj.title}`, content: `${updateObj.content}`, folder_id:`${updateObj.folder_id}`})  
    .where(function(){
      if(noteId){
        this.where('id', noteId);
      }
    })
    .returning('id')
    .then(([noteId]) =>{
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(item=>res.json(item))
    .catch(err => next(err));
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content, folder_id } = req.body; // Add `folder_id`
  /*
  REMOVED FOR BREVITY
  */
  const newItem = {
    title: title,
    content: content,
    folder_id: folder_id  // Add `folder_id`
  };

  let noteId;

  // Insert new note, instead of returning all the fields, just return the new `id`
  knex.insert(newItem)
    .into('notes')
    .returning(['id', 'title', 'content' ])
    .then(([id]) => {
      noteId = id;
      // Using the new id, select the new note and the folder
      return knex.select('notes.id', 'title', 'content', 'folder_id', 'folders.name as folder_name')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      console.error(err);
    });
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