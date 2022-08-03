const express = require('express');
const controller = require('../controller/userController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');
const {validateSignUp, validateLogIn, validateResult} = require('../middlewares/validator');
const router = express.Router();

//get the sign up form
router.get('/new',isGuest, controller.new);

//register the user or create a new user
router.post('/', isGuest, validateSignUp, validateResult, controller.create);

//get the login form
router.get('/login', isGuest, controller.getUserlogin);

//process login request
router.post('/login',isGuest,validateLogIn, validateResult,  controller.login);

router.get('/profile',isLoggedIn, controller.profile);

router.get('/logout', isLoggedIn, controller.logout);



module.exports = router;