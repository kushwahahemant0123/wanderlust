if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const Listing = require("./models/listing.js");
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/expressError.js');
const {listingSchema, reviewSchema} = require('./schema.js');
const Review = require("./models/review.js");
const listingsRouter= require("./routes/listing.js");
const reviewsRouter= require("./routes/review.js");
const userRouter = require('./routes/user.js');
const session= require('express-session');
const MongoStore=require("connect-mongo");
const flash= require('connect-flash');
const passport= require('passport');
const localStrategy= require("passport-local");
const User= require('./models/user.js');
const multer  = require('multer');
const { error } = require('console');


// const MONGO_URL='mongodb://127.0.0.1:27017/wanderlust'; 
const dbUrl=process.env.ATLASDB_URL


app.engine('ejs', ejsMate);





app.use(methodOverride('_method'));
app.set("view engin", "ejs");
app.set("views", path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const store= MongoStore.create({
    mongoUrl:dbUrl,
    crypto:{
        secret:process.env.SECRET, 
    },
    touchAfter: 24*60*60,
});

store.on("error",()=>{
console.log("ERROR in MONGO SESSION STORE",error);
})

const sessionOption=
{
store,
secret: process.env.SECRET, 
resave: false, 
saveUninitialized: true,
cookie:{
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
}}


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next)=>{
    res.locals.success= req.flash('success');
    // console.log(res.locals.success);
    res.locals.error= req.flash('error');
    res.locals.currUser=req.user;
    
    next();
})

// app.get('/demouser',async(req, res)=>{
//     let fakeUser= new User({
//         email: 'hk575575575@gmail.com',
//         username: "hemant410"
//     });

//     let newUser= await User.register(fakeUser, "hemant");
//     res.send(newUser);
// })




app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/", userRouter);

main().then((res) => {
    console.log("connect");
}).catch((err) => {
    console.log(err);
})

async function main() {
    await mongoose.connect(dbUrl);
}

// app.get('/testlisting', (req, res) => {

//     let sampleListing = new Listing({
//         title: "my new villa",
//         description: "by the beach",
//         price: 1200,
//         locatiion: "Siyavas, MP",
//         country: "India",
//     });
//     sampleListing.save().then((res) => {
//         console.log(res);
//     }).catch((err) => {
//         console.log(err);
//     });
// });

// let {title, description, price, location ,country,url}=req.body;
// let listing= new Listing({
//     title:title,
//     description:description,
//     price:price,
//     location:location,
//     country:country,
//     image:{
//         url:url,
//     },
// });
//  await listing.save();






app.all('*', (req, res, next) => {
    next(new ExpressError(404, "page note found!"));
})

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'something went wrong' } = err;
    res.status(statusCode).render("error.ejs", { err });

    // res.status(statusCode).send(message);

})

app.listen(8080, (req, res) => {
    console.log('listening on port 8080')
});