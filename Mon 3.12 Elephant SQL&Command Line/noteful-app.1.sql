SELECT CURRENT_DATE;

CREATE TABLE notes2(
  id serial PRIMARY KEY,
  title text NOT NULL,
  content text NOT NULL,
  created timestamp DEFAULT current_timestamp
);

ALTER SEQUENCE notes2_id_seq RESTART WITH 1005;

INSERT INTO notes2
  (title, content) 
  VALUES
    ('Note 1', 'La de Dah!')
        RETURNING id, title;

INSERT INTO notes2
  (title, content) 
  VALUES
    ('Note 2', 'Cats!')
        RETURNING id, title;

INSERT INTO notes2
  (title, content) 
  VALUES
    ('Note 3', 'Dogs!')
        RETURNING id, title;