'use strict';

const bycrpypt = require('bcryptjs');
const password = 'blacklavender4212';
// 'sheepish1010'

bycrpypt.hash(password, 10)
  .then(digest => {
    console.log('digest = ', digest);
    return digest;
  })
  .catch(err => {
    console.error('error', err);
  });
  
