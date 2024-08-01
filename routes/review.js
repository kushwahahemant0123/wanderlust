const express= require('express');
const router= express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/expressError.js');
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {validateReview, isReviewOwner, isLoggedIn}=require("../middleware.js");
const reviewControllers=require('../controllers/reviews.js');

//Reviews
//Post review route
router.post('/', isLoggedIn ,validateReview, wrapAsync(reviewControllers.createReview)
);

//Delete review route
router.delete('/:reviewId',isReviewOwner, wrapAsync(reviewControllers.destroyReview)
);

module.exports = router;