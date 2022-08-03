//require modules
const express = require('express');
const ejs = require('ejs');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const connectionRoutes = require('./routes/connectionRoutes');
const mainRoutes = require('./routes/mainRoutes');
const userRoutes = require('./routes/userRoutes');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');

//create app
const app = express();

//configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');

//mount the middleware
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
app.use(morgan('tiny'));
app.use(methodOverride('_method'));

//connect to database named IMC
mongoose.connect('mongodb://localhost:27017/IMC',{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
.then(()=>{
    app.listen(port,host,()=>{
        console.log('Server is running on port', port);
    })
})
.catch(err=> console.log(err.message));

//mount middlware
app.use(
    session({
        secret: "ajfeirf90aeu9eroejfoefj",
        resave: true,
        saveUninitialized: true,
        store: new MongoStore({mongoUrl: 'mongodb://localhost:27017/IMC'}),
        cookie: {maxAge: 60*60*1000}
        })
);

app.use(flash());


app.use((req, res, next) => {
    console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.firstName = req.session.firstName||null;
    res.locals.lastName = req.session.lastName||null;
    console.log('Session'+res.locals.user);
    res.locals.errorMessages = req.flash('error');
    res.locals.successMessages = req.flash('success');
    next();
});

//set up routes
app.use('/', mainRoutes);
app.use('/connections', connectionRoutes);
app.use('/users', userRoutes);
app.use((req,res,next)=>{
    let err = new Error('The server cannot locate '+ req.url);
    err.status = 404;
    next(err);
});
app.use((err,req,res,next)=>{
    console.log(err.stack);
    console.log(err.status);
    if(!err.status){
        err.status= 500;
        err.message = ("Internal server error");
    }
    res.status(err.status);
    res.render('error',{error : err});
});


