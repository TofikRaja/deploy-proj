const Listing = require("./models/listing");
const Review = require("./models/review");
const { listingSchema, reviewSchema} = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

       // middleware to check the user is loggedin or not
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {// method to find a user is authenticate or not
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

     // middleware to save the redirectUrl
module.exports.saveRedirectUrl = (req,res, next) => {
  if(req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
}

     // middleware to check the owner
module.exports.isOwner = async (req,res,next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.currUser._id)){
    req.flash("error", "you are not the Owner of this Listing!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}


         //validation for schema middleware for listings
module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if(error){
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg );
  }else{
    next();
  }
}


//validation for schema middleware for reviews

module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if(error){
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg );
  }else{
    next();
  }
}
 
   // middleware to check the reviewauthor
module.exports.isReviewAuthor = async (req,res,next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.currUser._id)){
    req.flash("error", "you are not the Author of this Review!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}