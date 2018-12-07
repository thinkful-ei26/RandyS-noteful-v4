'use strict';

const mongoose = require('mongoose');
const passport = require('passport');

const express = require('express');
const router = express.Router();

const User = require('../models/user');

// router.use('/', passport.authenticate('jwt', {session: false, failWithError: true}));

router.post('/', (req, res, next) => {
  
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));
  
  if (missingField) {
    const err = new Error(`Missing '${missingField}' in request body`);
    err.status = 422;
    return next(err);
  }
  
  const stringFields = ['username', 'password', 'fullname'];
  const missingStringFields = stringFields.find(field => field in req.body && typeof req.body[field] !== 'string');
  
  if (missingStringFields) {
    const err = new Error(`'${missingStringFields}' must be a string`);
    err.status = 422;
    return next(err);
  }

  const trimmedFields = ['username', 'password'];
  const nonTrimmedFields = trimmedFields.find(field => req.body[field].trim() !== req.body[field]);
  if (nonTrimmedFields) {
    const err = new Error(`Your ${nonTrimmedFields} must not have any spaces`);
    err.status = 422;
    return next(err);
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields)
    .find(field => 'min' in sizedFields[field] && 
    sizedFields[field].min > req.body[field].trim().length);
  
  if (tooSmallField) {
    const min = sizedFields[tooSmallField].min;
    const err = new Error(`Field: '${tooSmallField}' must be at least ${min} characters long`);
    err.status = 422;
    return next(err);
  }
 
  const tooBigField = Object.keys(sizedFields)
    .find(field => 'max' in sizedFields[field] && 
    sizedFields[field].max < req.body[field].trim().length);

  if (tooBigField) {
    const max = sizedFields[tooBigField].max;
    const err = new Error(`Field: '${tooBigField}' must be at most ${max} characters long`);
    err.status = 422;
    return next(err);
  }

  let { fullname, username, password } = req.body;
  if (fullname) {
    fullname = fullname.trim();
  }
  

  return User.hashPassword(password)
    .then(digest => {
      const newUser = {
        username,
        password: digest,
        fullname
      };
      return User.create(newUser);
    })
    .then(result => {
      res.status(201).location(`/api/users/${result.id}`).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('That username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;