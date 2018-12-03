'use strict';

const passport = require('passport');
const express = require('express');
const router = express.Router();

const options = {session: false, failWithError: true};

const localAuth = passport.authenticate('local', options);

router.post('/', localAuth, function(req, res) {
  console.log(`${req.user.username} successfully logged in.`);
  return res.json(req.user);
});

module.exports = router;