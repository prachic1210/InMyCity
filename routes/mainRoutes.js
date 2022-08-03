const express = require('express');
const controller = require('../controller/mainController');
const {isGuest, isLoggedIn} = require('../middlewares/auth');

const router = express.Router();

//GET: send landing page 
router.get('/',  controller.index );

//GET: send html about page
router.get('/about',  controller.about );

//GET: send html contact page
router.get('/contact',  controller.contact );

module.exports = router;