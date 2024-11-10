const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

       // test for listing route
// app.get("/test", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the Beach",
//         price: 2000,
//         location: "Jaipur, Rajasthan",
//         country: "India"
//     });
// await sampleListing.save();
// console.log("Sample is saved");
// res.send("Successful testing");
// } );


router
  .route("/")
  .get(wrapAsync(listingController.index)) // index route
  .post(
    //create route
    isLoggedIn,
    
    upload.single("listing[imageURL]"),
    validateListing,
    wrapAsync(listingController.createListing)
  );

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm);


router
  .route("/:id")
  // Show route
  .get(wrapAsync(listingController.showListing))
  //Update route
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[imageURL]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //Delete route
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));



//Edit route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
