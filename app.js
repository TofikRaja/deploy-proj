if(process.env.NODE_ENV != "production"){
require("dotenv").config();
}

const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
const mongoose = require("mongoose");
const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const dbUrl = process.env.ATLASDB_URL;

main()
  .then((res) => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
    touchAfter: 24 * 3600,
  }
});

store.on("error", () => {
  console.log("Error in MONGO Session", err);
})

     // express-session

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 *1000,
    maxAge: 7 * 24 * 60 * 60 *1000,
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

      // to implement passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());   // to store info
passport.deserializeUser(User.deserializeUser());  // to remove info

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/demouser", async (req,res) => {
  let fakeUser = new User({
    email: "abc@gmail.com",
    username: "delta",
  });

  let registeredUser = await User.register(fakeUser, "password");  // to save into database
  res.send(registeredUser);
});

app.use("/listings", listingRouter); // to match the route of listings
app.use("/listings/:id/reviews", reviewRouter);   // to match the route of reviews
app.use("/", userRouter); 

// Custom error handler

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something Went Wrong!"} = err;
  res.status(statusCode).render("error.ejs", { err });
})