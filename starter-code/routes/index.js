const express = require('express');
const router  = express.Router();
const bcrypt = require('bcrypt');

// User model
const User           = require("../models/user");


/* GET home page */
router.get('/', (req, res, next) => {
  console.log(req.session);
  res.render('index');
});

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', async (req, res, next) => {
  const {username, password} = req.body;
  let hashPassword;

  if(username === '' || password === ''){
    res.render('signup', {errorMessage: 'Please provide an user and password'});
    return
  }

  if (password) {
    const saltRouds = 10;
    const salt = bcrypt.genSaltSync(saltRouds);
    hashPassword = bcrypt.hashSync(password, salt);
  }

  try {
    const user = await User.findOne({username: username})
    if(user !== ""){
      await new User({username, password: hashPassword}).save();
      res.redirect('/');
    }
  } catch (error) {
    res.render('signup', {errorMessage: 'Please provide an unique username'});
  }
  
});

router.get('/login', (req, res, next) => {
  res.render('login');

});

router.post('/login', async (req, res, next) => {
  try {
    const {username, password} = req.body;
    console.log(req.body)
    if(username === '' || password === ''){
      res.render('login', {errorMessage: 'Please provide a valid user and password'});
      return;
      }   
    const user = await User.findOne({username: username});
    if(!user){
      res.render('login', {errorMessage: 'Invalid user or password'});
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid){
      res.render('login', {errorMessage: 'Invalid user or password'});
      return;
    }

    req.session.loggedUser = user;
    console.log(req.session);
    res.render('index');

  } catch (error) {
    throw new Error(error);
  }
});

router.get('/logout', (req, res, next) => {
  console.log(req.session)
  req.session.destroy((err) => {
    res.redirect('/');

  });
  console.log(req.session)
});

module.exports = router;
