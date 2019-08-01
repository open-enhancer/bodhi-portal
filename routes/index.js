var express = require('express');
var router = express.Router();
var apiController = require('../controllers/api');
var homeController = require('../controllers/home');
var userAuthController = require('../controllers/userauth');

// Status check
router.get('/__status', function(req, res) {
    res.send('OK');
});

// Home page
router.get('/', homeController.index);

// Login page
router.get('/login', homeController.login);

// User login / logout
router.get('/login/captcha', userAuthController.captcha);
router.post('/login/do', userAuthController.login);
router.post('/logout', userAuthController.logout);

// API
router.post('/api/isLoggedIn', apiController.isLoggedIn);
router.post('/api/logout', apiController.logout);

module.exports = router;
