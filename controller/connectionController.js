const { DateTime } = require('luxon');
const model = require('../models/connection.js');
const rsvp = require('../models/rsvp.js');

//render connections index page
exports.index = (req,res,next) =>{
    let checkIfEmptyConnection = 'false';
    let topics =[];              
    model.find()
    .then(connections=>{
        if(connections){
        topics= connections.filter((c, index)=> connections.findIndex(a => a['topic'] === c['topic']) === index).map(c => c.topic) ;  
        res.render('./connections/index', {connections, topics,checkIfEmptyConnection})
    }
})
    .catch(err=> next(err));
};

//render new connections  page
exports.new = (req,res) =>{
    console.log('Create connection'+ (DateTime.now().minus({days: 1}).toLocaleString()) );
    res.render('./connections/new');
};

//create a connection 
exports.create = (req,res,next) => {
    //create a document for connection
    let connect = new model(req.body);
    connect.hostName = req.session.user;
    
    //save a document
    connect.save()
    .then((connect)=>{
        let date=  DateTime.fromJSDate(connect.date).toObject();
        connect.date =  DateTime.fromJSDate({year:date.year, month:date.month, day: date.day, hour: DateTime.now().hour, minutes: DateTime.now().minutes}).toISO({includeOffset: true});
        req.flash('success', 'Connection has been created successfully');
        res.redirect('/connections');
    })
    .catch(err=> {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('back');
            }
            next(err);
    });   
};

//show connections
exports.show = (req,res,next) => {
    let id = req.params.id;
    console.log('ID'+id);
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
    let count =0;
    //get total rsvpd guests for an event
    rsvp.find({connection: id})
    .then((results)=>{
        if(results){
            let result = results.filter((res)=>{ if(res.response.toUpperCase() === 'YES'){return res;} });
            console.log('results'+ result);
        if(result.length != null && result.length > 0)
        count = result.length;
        }
        if(results == null){
            count =0;
        }
    })
    .catch(err=> next(err));
    model.findById(id).populate('hostName','firstName lastName')
    .then(connect=>{
        if(connect){
            //Settings.defaultZone = 'America/New_York';               
            let connectDate1= DateTime.fromJSDate(connect.date).toUTC();
            let connectDate = connectDate1.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);
            res.render('./connections/show', {connect, connectDate, count});
        }
        else{
            let err = new Error('Cannot find connection with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> next(err));
    
};

//get view for editing a connection
exports.edit = (req,res,next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
    model.findById(id)
    .then(connection=>{
        if(connection){
            let connectionDate= DateTime.fromJSDate(connection.date).toUTC().toFormat('yyyy-MM-dd');
            return res.render('./connections/edit',{connection, connectionDate});
        }
        else{
            let err = new Error('Cannot find connection with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> next(err));  
};

//Update edited connection
exports.update = (req,res,next) => {
    let connection = req.body;
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndUpdate(id,connection,{useFindAndModify:false})
    .then(connection=>{
        if(connection){
            res.redirect('/connections/'+id);
        }
        else{
            let err = new Error('Cannot find connection with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=>{
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('back');
            }
            next(err);
    });
};

//delete a connection
exports.delete = (req,res,next) => {
    let id = req.params.id;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
        let err = new Error('Invalid connection id');
        err.status = 400;
        return next(err);
    }
    model.findByIdAndDelete(id)
    .then(connect=>{
        if(connect){
            rsvp.findOneAndDelete({connection: id})
            .then(connect=>{
             if(connect){
                 console.log('ID'+id);
            //req.flash('success', 'RSVP was successfully deleted');
            //res.redirect('/users/profile');
        }
        else{
            let err = new Error('Cannot find rsvp with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> next(err));
            res.redirect('/connections');
        }
        else{
            let err = new Error('Cannot find connection with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> next(err));


};

//create rsvp for connection
exports.createRsvp = (req, res, next) => {

    let rsvpDocument = req.params;
    
    rsvpDocument.userId = req.session.user;
    rsvpDocument.connection = req.params.id;
    rsvpDocument.response = req.params.response;
    //rsvpDocument.name = req.params.name;
    //rsvpDocument.topic = req.params.topic;
    let isUpdated = "xyz";
    let rsvpModel = new rsvp(rsvpDocument);

    //get all rsvp event by the user
    rsvp.findOneAndUpdate({ userId: rsvpDocument.userId, connection: rsvpDocument.connection },  rsvpDocument, {upsert: true ,useFindAndModify:false}) 
       .then(result => {
            //let rsvpEvents = result;
            //res.render('./user/profile',{user, connections, rsvpEvents})
            console.log('res'+result);
            if (result) {
                result.response = rsvpDocument.response;
                req.flash('success', 'Your response has been updated successfully for the connection');
                res.redirect('/users/profile');
            }
            else{
                req.flash('success', 'You have been RSVPd successfully for the event');
                res.redirect('/users/profile');
            }

        })
        .catch(err => next(err));
}



//get the connection detail page on click of update button of RSVP
exports.editRsvp = (req, res, next) => {
    const rsvpDocument = new rsvp();
    rsvpDocument.connectionId = req.params.id;
    model.findById(rsvpDocument.connectionId)
        .then((connection) => {
            if (connection) {
                res.redirect('/connections/' + rsvpDocument.connectionId);
            }
            else {
                let err = new Error('Cannot find connection with id ' + id);
                err.status = 404;
                next(err);
            }

        })
        .catch((err) => next(err));
}

//delete a rsvp
exports.deleteRsvp = (req,res,next) => {
    let id = req.params.id;
    console.log('ID'+ id);
    rsvp.findByIdAndDelete(id)
    .then(connect=>{
        if(connect){
            req.flash('success', 'RSVP was successfully deleted');
            res.redirect('/users/profile');
        }
        else{
            let err = new Error('Cannot find rsvp with id '+ id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err=> next(err));
};
