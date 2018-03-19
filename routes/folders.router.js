'use strict';

const knex = require('../knex');
const express = require('express');
const router = express.Router();

router.get('/folders', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;
  knex('folders')
    .select()
    .where(function(){
      if(folderId){
        this.where('id', `${folderId}`);
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


router.put('/folders/:id', (req, res, next) => {
  const folderId = req.params.id;
  const updateObj = {};
  const updateableFields = ['name'];
  
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  
  /***** Never trust users - validate input *****/
  if (!updateObj.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex('folders')
    .where(function(){
      if(folderId){
        this.where('id', `${folderId}`);
      }
    })
    .update({name: `${updateObj.name}`})
    .then(item=>res.json(item))
    .catch(err => next(err));
});

router.post('/folders', (req, res, next) => {
  const { name } = req.body;
    
  const newItem = { name };
  
  if (!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('folders')
    .insert(newItem)
    .then(item => res.location(`http://${req.headers.host}/folders/${item.id}`)
      .status(201).json(item)
    )
    .catch(err => next(err));
});

router.delete('/folders/:id', (req, res, next) => {
  const id = req.params.id;

  knex('folders')
    .where('id', `${id}`)
    .del()
    .then(deleted => res.status(204).end());
});


module.exports = router;