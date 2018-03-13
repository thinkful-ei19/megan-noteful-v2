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
  const { searchTerm } = req.query;
  /* 
  notes.filter(searchTerm)
    .then(list => {
      res.json(list);
    })
    .catch(err => next(err)); 
  */
  //becomes:
  knex('notes')
    .select('id', 'title', 'content')
    .where(function(){
      if(searchTerm){
        this.where('title', 'like',`%${searchTerm}%`);
      }})
    .then(list => {
      res.json(list);
    }).catch(err=>next(err));
});

/* ========== GET/READ SINGLE NOTES ========== */
router.get('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  //match by noteId
  /*
  notes.find(noteId)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */
  knex('notes')
    .select()
    .where(function(){
      if(noteId){
        this.where('id', `${noteId}`);
      }
      else{
        next();
      }
    })
    .then(item => {
      res.json(item);
    })
    .catch(err=>next(err));
});
///how do i get it to through the error?



/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/notes/:id', (req, res, next) => {
  const noteId = req.params.id;
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

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

  /*
  notes.update(noteId, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => next(err));
  */

  knex('notes')
    .where(function(){
      if(noteId){
        this.where('id', `${noteId}`);
      }
    })
    .update({title: `${updateObj.title}`, content: `${updateObj.content}`})
    .then(item=>res.json(item))
    .catch(err => next(err));
});

/* ========== POST/CREATE ITEM ========== */
router.post('/notes', (req, res, next) => {
  const { title, content } = req.body;
  
  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  /*
  notes.create(newItem)
    .then(item => {
      if (item) {
        res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
      } 
    })
    .catch(err => next(err));
  */

  knex('notes')
    .insert(({title : `${newItem.title}`, content :`${newItem.content}`}))
    .then(item => res.location(`http://${req.headers.host}/notes/${item.id}`)
      .status(201).json(item)
    )
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