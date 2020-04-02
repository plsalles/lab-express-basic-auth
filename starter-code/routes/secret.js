const express = require('express');
const router  = express.Router();
const User = require('../models/user');
const ensureLogin = require('connect-ensure-login');

router.get('/secret', ensureLogin.ensureLoggedIn(), (req, res) => {
  res.render('private', { user: req.user });
});

// router.get('/secret', (req, res, next) => {
//     res.render('private');
//   });

  module.exports = router;