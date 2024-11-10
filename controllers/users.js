const User = require("../models/user");

module.exports.renderSignupForm = (req, res) => {
    res.render("./users/signup.ejs");
  }

module.exports.signup =async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({
        email: email,
        username: username,
      });
      const registeredUser = await User.register(newUser, password);
      console.log(registeredUser);
      req.login(registeredUser, (err) => {
        if (err) {
          next(err);
        }
        req.flash("success", "User Registered Successfully");
        res.redirect("/listings");
      });
    } catch (err) {
      req.flash("error", err.message);
      res.redirect("/signup");
    }
  };

  module.exports.renderLoginForm =(req, res) => {
    res.render("./users/login.ejs");
  };


  module.exports.login = async (req, res) => {
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    if (res.locals.redirectUrl) {
      res.redirect(res.locals.redirectUrl);
    } else {
      res.redirect("/listings");
    }
  };


  module.exports.logout = (req, res, next) => {
    req.logout((err) => {
      // function to logout the user automatically
      if (err) {
        next(err);
      }
      req.flash("success", "you are logged out!");
      res.redirect("/listings");
    });
  };