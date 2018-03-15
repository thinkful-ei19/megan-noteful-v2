'use strict';

const knex = require('../knex');
const express = require('express');
const router = express.Router();

router.get('/tags', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

router.get('/tags/:id', (req, res, next) => {
  const tagsId = req.params.id;
  knex('tags')
    .select()
    .where(function(){
      if(tagsId){
        this.where('id', `${tagsId}`);
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

router.post('/tags', (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    const err = new Error('Missing `tag name` in request body');
    err.status = 400;
    return next(err);
  }
  
  const newItem = { name };
  
  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});

router.put('/tags/:id', (req, res, next) => {
  const tagsId = req.params.id;
  const updateObj = {};
  const updateableFields = ['name'];
    
  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
    
  if (!updateObj.name) {
    const err = new Error('Missing `tag name` in request body');
    err.status = 400;
    return next(err);
  }
  
  knex('tags')
    .where(function(){
      if(tagsId){
        this.where('id', `${tagsId}`);
      }
    })
    .update({name: `${updateObj.name}`})
    .then(item=>res.json(item))
    .catch(err => next(err));
});

router.delete('/tags/:id', (req, res, next) => {
  const id = req.params.id;
  
  knex('tags')
    .where('id', `${id}`)
    .del()
    .then(deleted => res.status(204).end());
});
  

module.exports = router;