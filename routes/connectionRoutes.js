const express = require('express');
const controller = require('../controller/connectionController');
const { isLoggedIn, isHost, isHostRSVP} = require('../middlewares/auth');
const {validateConnection, validateResult, validateId} = require('../middlewares/validator');
const router = express.Router();

//GET /connections: show all connections 
router.get('/', controller.index );

//GET /connections/new: send html form for creating a new connection
router.get('/new',isLoggedIn, controller.new);

//POST /connections: create new connection
router.post('/', isLoggedIn, validateConnection,validateResult,controller.create);

//GET /connections:id: send details of the connection identified by id
router.get('/:id', validateId, controller.show);

//GET /connections:id: send html form for editing a connection identified by id
router.get('/:id/:edit',validateId, isLoggedIn, isLoggedIn,isHost, controller.edit);

//PUT /connections:id: Update the connection identified by id
router.put('/:id', validateId, isLoggedIn,isLoggedIn, isHost,validateConnection,validateResult,  controller.update);

//DELETE /connections:id: Delete the connection identified by id
router.delete('/:id', validateId, isLoggedIn, isHost, controller.delete);

//POST rsvp to an event
router.post('/:id/rsvp/:response', validateId, isLoggedIn, isHostRSVP ,validateResult, controller.createRsvp);

//GET get connection detail page for update rsvp
router.get('/rsvp/:id/edit', validateId, isLoggedIn, controller.editRsvp);

//DELETE /rsvps/connectionId: Delete the rsvp identified by connectionId
router.delete('/rsvp/:id', validateId, isLoggedIn,  controller.deleteRsvp);


module.exports = router;