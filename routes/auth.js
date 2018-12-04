'use strict';

const passport = require('passport');
const express = require('express');
const jwt = require('jsonwebtoken');
// const config = require('../config');

const {JWT_SECRET, JWT_EXPIRY} = require('../config');
const router = express.Router();

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);
const jwtAuth = passport.authenticate('jwt', {session: false, failWithError: true});

function createAuthToken (user) {
  return jwt.sign({ user }, JWT_SECRET, {
    subject: user.username,
    expiresIn: JWT_EXPIRY
  });
}

router.post('/', localAuth, function(req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  const authToken = createAuthToken(req.user);

  return res.json({authToken});
});

router.post('/refresh', jwtAuth, function(req, res) { 
  const authToken = createAuthToken(req.user);
  res.json({authToken});
});

module.exports = router;