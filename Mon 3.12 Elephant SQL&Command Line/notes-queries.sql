SELECT * FROM notes;

SELECT * FROM notes LIMIT 5;

SELECT * FROM notes ORDER BY content ASC;

SELECT * FROM notes ORDER BY content DESC;

SELECT * FROM notes ORDER BY title DESC;

SELECT * FROM notes WHERE title= 'Hello';

SELECT * FROM notes WHERE title LIKE 'Note%';
-- note to self: uppercase vs lowercase will change if it shows up or not

UPDATE notes
  SET title = 'Cheese'
  WHERE id = 3;

UPDATE notes
  SET content = 'Cheese is good'
  WHERE id = 3;

INSERT INTO notes (title, content) VALUES ('Test','HELLOOOOOO') RETURNING id, content;
--tested to make sure doesn't work when theres no title, then put in title

DELETE FROM notes WHERE title='Cheese';