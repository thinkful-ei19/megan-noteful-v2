'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://yrxagrxf:I6u8YWwHWeCXERZ5kDuQJGBqIoxNisKf@nutty-custard-apple.db.elephantsql.com:5432/yrxagrxf',
    debug: true, // http://knexjs.org/#Installation-debug
    pool: {min : 1 , max : 2}
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
};
