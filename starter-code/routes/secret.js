const express = require('express');
const router  = express.Router();
const User = require('../models/user');


router.get('/secret', (req, res, next) => {
    res.render('private');
  });

  module.exports = router;