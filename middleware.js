const Listing = require("./models/listing");
const Review= require("./models/review.js")
const ExpressError = require('./utils/expressError.js');
const {listingSchema,reviewSchema} = require('./schema.js');


module.exports.isLoggedIn=(req, res, next)=>{
    if(!req.isAuthenticated()){
        console.log(req.originalUrl);
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "you must be logged in ");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl= (req, res, next)=>{
    if(req.session.redirectUrl){
       res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner= async(req, res, next)=>{
    
    let { id } = req.params;
    let listing= await Listing.findById(id);
    if(!listing.owner._id.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to do this.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let { error, value } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
}

module.exports.validateReview=(req, res, next)=>{
    let {error, value}= reviewSchema.validate(req.body);
    if(error){
        let errMsg= error.details.map((el)=> el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else {
        next();
    }
};

module.exports.isReviewOwner= async(req, res, next)=>{
    let {id, reviewId}=req.params;
    let review= await Review.findById(reviewId);
    console.log(review);
    if(!res.locals.currUser || !res.locals.currUser._id.equals(review.author._id)){
        req.flash("error", "Sorry!, You do not owner of the review.")
        res.redirect(`/listings/${id}`);
    }else{
        next();
    }
};