const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const rsvpSchema = new Schema({
    connection: {type: Schema.Types.ObjectId, ref: 'Connection'},
    userId:{type: Schema.Types.ObjectId, ref: 'User'},
    response:{type: String, required: [true, 'response is required']}, //yes or no or maybe
    
   });


module.exports = mongoose.model('Rsvp', rsvpSchema);