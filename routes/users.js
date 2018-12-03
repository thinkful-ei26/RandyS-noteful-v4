'use strict';

const mongoose = require('mongoose');

const express = require('express');
const router = express.Router();

const User = require('../models/user');

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

  // if (req.body.username.length < 1) {
  //   const err = new Error('Your username must be at least 1 character long');
  //   err.status = 422;
  //   return next(err);
  // }

  // if (req.body.password.length < 8) {
  //   const err = new Error('Your password must be between at least 8 characters long');
  //   err.status = 422;
  //   return next(err);
  // } else if (req.body.password.length > 72 ){
  //   const err = new Error('Your password can be a maximum of 72 characters long');
  //   err.status = 422;
  //   return next(err);
  // }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 8,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizedFields).find(field => 'min' in sizedFields[field] && field.min > req.body[field].trim().length);
  const tooBigField = Object.keys(sizedFields).find(field => 'max' in sizedFields[field] && field.max < req.body[field].trim().length);
  
  if (tooSmallField || tooBigField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField 
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooBigField]
          .max} characters long`,
      location: tooSmallField || tooBigField
    });
  }

  const { fullname, username, password } = req.body;

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