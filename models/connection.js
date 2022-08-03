const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const connectionSchema = new Schema({
 name:{type: String, required:[true,'title is required'], minLength:[3,'Name must be 3 or more characters']},
 tagLine:{type: String, required:[true,'tagLine is required'], minLength:[3,'Tagline must be 3 or more characters']},
 topic:{type: String, required:[true,'topic is required'], minLength:[3,'Topic must be 3 or more characters']},
 details:{type: String, required:[true,'details is required'], minLength:[10,'the content should have atleast 10 characters']},
 startTime:{type: String, required: [true,'startTime is required']},
 endTime:{type: String, required: [true, 'endTime is required']},
 hostName:{type: Schema.Types.ObjectId, ref: 'User'},
 date:{type: Date, required: [true, 'Date is required']},
 image:{type: String, required:[true, 'Image link is required']},
 address:{type:String, required:[true, 'address is required and cannot be empty']}
});


//name of the collection in database is connections
module.exports = mongoose.model('Connection', connectionSchema);


