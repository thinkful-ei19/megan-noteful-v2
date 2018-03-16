'use strict';

/**
 * DISCLAIMER:
 * The examples shown below are superficial tests which only check the API responses.
 * They do not verify the responses against the data in the database. We will learn
 * how to crosscheck the API responses against the database in a later exercise.
 */
const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');
const knex = require('../knex');
const seedData = require('../db/seed');

const expect = chai.expect;

chai.use(chaiHttp);

describe('Reality Check', () => {

  it('true should be true', () => {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4, unless it is 1984 ;-)', () => {
    expect(2 + 2).to.equal(4);
  });

});

describe('Environment', () => {

  it('NODE_ENV should be "test"', () => {
    expect(process.env.NODE_ENV).to.equal('test');
  });

  it('connection should be test database', () => {
    expect(knex.client.connectionSettings.database).to.equal('jxmzrscj');
  });

});

describe('Basic Express setup', () => {

  describe('Express static', () => {

    it('GET request "/" should return the index page', () => {
      return chai.request(app)
        .get('/')
        .then(function (res) {
          expect(res).to.exist;
          expect(res).to.have.status(200);
          expect(res).to.be.html;
        });
    });

  });

  describe('404 handler', () => {

    it('should respond with 404 when given a bad path', () => {
      return chai.request(app)
        .get('/bad/path')
        .catch(err => err.response)
        .then(res => {
          expect(res).to.have.status(404);
        });
    });

  });
});

describe('Noteful API', function () {
  before(function () {
    // noop
  });

  beforeEach(function () {
    return seedData();
  });

  afterEach(function () {
    // noop
  });

  after(function () {
    return knex.destroy(); // destroy the connection
  });



  describe('GET /api/notes', function () {
    //done
    it('should return the default of 10 Notes ', function () {
      let count;
      return knex.count()
        .from('notes')
        .then(([result]) => {
          count = Number(result.count);
          return chai.request(app).get('/api/notes');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(count);
        });
    });
    //done?
    it('should return a list with the correct right fields', function () {
      let count;
      return knex('notes').count()
        .then(([result]) => {
          count = Number(result.count);
          return chai.request(app).get('/api/notes');
        })
        .then(function (res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(count);
          res.body.forEach(function (item) {
            expect(item).to.be.a('object');
            expect(item).to.include.keys('id', 'title', 'content', 'folder_id', 'folderName', 'tags');
          });
        });
    });


    //done
    it('should return correct search results for a searchTerm query', function () {
      let res;
      return chai.request(app).get('/api/notes?searchTerm=gaga')
        .then(function (_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(1);
          expect(res.body[0]).to.be.an('object');
          return knex.select().from('notes').where('title', 'like', '%gaga%');
        })
        .then(data => {
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });

    //done
    it('should search by folder id', function () {
      const dataPromise = knex.select()
        .from('notes')
        .where('folder_id', 103)
        .orderBy('notes.id');

      const apiPromise = chai.request(app)
        .get('/api/notes?folderId=103');

      return Promise.all([dataPromise, apiPromise])
        .then(function ([data, res]) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(2);
          expect(res.body[0]).to.be.an('object');
          expect(res.body[0].id).to.equal(data[0].id);
        });
    });


    it('should return an empty array for an incorrect query', function () {
      
      let res;
      return chai.request(app).get('/api/notes?searchTerm=Not%20a%20Valid%20Search')
        .then(function (_res) {
          res=_res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.length(0);
          return knex('notes').select().where('title', 'like', 
            '%Not a valid search%');
        })
        .then(data=>{
          expect(res.body.length).to.equal(data.length);
        });
    });

  });

  describe('GET /api/notes/:id', function () {

    it('should return correct notes', function () {
      let res;
      return chai.request(app).get('/api/notes/1000')
        .then(function (_res) {
          res=_res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.include.keys('id', 'title', 'content');
          expect(res.body.id).to.equal(1000);
          expect(res.body.title).to.equal('5 life lessons learned from cats');
          return knex('notes').select().where('id', 1000);
        })
        .then(data=>{
          expect(res.body.id).to.equal(data[0].id);
          expect(res.body.title).to.equal(data[0].title);
          expect(res.body.content).to.equal(data[0].content);
          expect(res.body.folder_id).to.equal(data[0].folder_id);
        });
    });
  });

  describe('POST /api/notes', function () {
    //done
    it('should create and return a new item when provided valid data', function () {
      const newItem = {
        'title': 'The best article about cats ever!',
        'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...',
        'tags': []
      };
      let body;
      return chai.request(app)
        .post('/api/notes')
        .send(newItem)
        .then(function (res) {
          body = res.body;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(body).to.be.a('object');
          expect(body).to.include.keys('id', 'title', 'content');
          return knex.select().from('notes').where('id', body.id);
        })
        .then(([data]) => {
          expect(body.title).to.equal(data.title);
          expect(body.content).to.equal(data.content);
        });
    });
    it('should return an error when missing "title" field', function () {
      const newItem = {
        'foo': 'bar'
      };
    
      let notesLength;

      return knex('notes').select()

        .then(arrayOfNotes =>{
          notesLength=arrayOfNotes.length;
          // console.log(notesLength);
          return chai.request(app).post('/api/notes').send(newItem)
            .catch(err => err.response);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `title` in request body');
          return knex('notes').select();
        })
        .then(data=>{
          expect (notesLength).to.equal(data.length);
        });
    });
        

    describe('PUT /api/notes/:id', function () {

      it('should update the note', function () {
        const updateItem = {
          'title': 'What about dogs?!',
          'content': 'woof woof',
          'tags': []
        };
        let body;
        return chai.request(app).put('/api/notes/1005').send(updateItem)
          .then(function (res) {
            body=res.body;
            expect(res).to.have.status(200);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body).to.include.keys('id', 'title', 'content');

            expect(res.body.id).to.equal(1005);
            expect(res.body.title).to.equal(updateItem.title);
            expect(res.body.content).to.equal(updateItem.content);
            return knex('notes').select().where('id', body.id);
          })
          .then(data =>{
            expect(body.title).to.equal(data[0].title);
            expect(body.content).to.equal(data[0].content);
          });
      });

      it('should return an error when missing "title" field', function () {
        const badItem = {
          'foo': 'bar'
        };

        let goodItem;
        return knex('notes').select().where('id', 1005)
          .then(res =>{
            goodItem = res;
            //console.log(goodItem);
            return chai.request(app)
              .put('/api/notes/1005')
              .send(badItem)
              .catch(err => err.response);
          })
          .then(res => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal('Missing `title` in request body');
            return knex('notes').select().where('id', 1005);
          })
          .then(data =>{
            expect(goodItem[0].title).to.equal(data[0].title);
            expect(goodItem[0].content).to.equal(data[0].content);
            expect(goodItem[0].id).to.equal(data[0].id);
          });
      });

    });

    describe('DELETE  /api/notes/:id', function () {

      it.only('should delete an item by id', function () {
          
        let beforeDelete;
        return knex('notes').select().where('id', 1005)
          .then(res=>{
            beforeDelete=res;
            return chai.request(app).delete('/api/notes/1005');
          })
          .then(function (res) {
            expect(res).to.have.status(204);
            return knex('notes').select().where('id', 1005);
          })
          .then(data=>{
            expect(beforeDelete[0]).to.not.equal(data[0]);
            expect(data).to.be.a('array');//empty array
            expect(data[0]).to.be.undefined;
            expect(data.length).to.equal(0);
          });
      });
    });
  });
});