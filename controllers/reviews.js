const Review = require("../models/review");
const Listing = require("../models/listing");

module.exports.createReview = async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id; // to store author of review
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("Review saved");
    req.flash("success", "New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  };


  module.exports.deleteReview = async (req, res, next) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", " Review Deleted!");
    res.redirect(`/listings/${id}`);
  };