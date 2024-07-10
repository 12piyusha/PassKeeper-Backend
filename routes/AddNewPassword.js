var express = require("express");
var router = express.Router();
var bodyParser = require("body-parser");
var path = require("path");
var userModule = require("../modules/user");
var passCatModule = require("../modules/passwordCategory");
var passModule = require("../modules/add_password");
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
var getPassCat = passCatModule.find({});
var getAllPass = passModule.find({});

//MIDDLEWARE for checking login and logout.
function checkLoginUser(req, res, next) {
  var UserToken = localStorage.getItem("UserToken");
  try {
    var decoded = jwt.verify(UserToken, "loginToken");
  } catch (err) {
    res.redirect("/");
  }
  next();
}

// New package install
// --->npm install bcryptjs-->this package is used to convert password into database into encrypted format for safety purpose.
//--->npm install node-localstorage
//-->npm install jsonwebtoken
//--->npm install express-validator
//--->npm install --save ckeditor-->for more effective texarea
//--->npm install mongoose-paginate-v2 -->for pagination for View Password Section
if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}

//MIDDLEWARE for checking duplicates values for email
function checkEmail(req, res, next) {
  var email = req.body.email;
  var checkExitsEmail = userModule.findOne({ email: email });
  checkExitsEmail.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render("signup", {
        title: "Password Management System",
        msg: "Email is Already Regsisterd",
      });
    }
    next();
  });
}
//MIDDLEWARE for checking duplicates values for username
function checkUsername(req, res, next) {
  var username = req.body.uname;
  var checkExitsUsername = userModule.findOne({ username: username });
  checkExitsUsername.exec((err, data) => {
    if (err) throw err;
    if (data) {
      return res.render("signup", {
        title: "Password Management System",
        msg: "Username is Already Regsisterd",
      });
    }
    next();
  });
}

router.get("/", checkLoginUser, function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");

  // Create a new query each time the route is accessed
  passCatModule.find({}, function (err, data) {
    if (err) throw err;
    res.render("addNewPassword", {
      title: "Password Management System",
      LoginUser: LoginUser,
      records: data,
      errors: "",
      success: "",
    });
  });
});

router.post("/", checkLoginUser, function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");
  var pass_cat = req.body.pass_cat;
  var pass_details = req.body.pass_details;
  var project_name = req.body.project_name;

  passModule.findOne(
    { password_category: pass_cat },
    function (err, existingPassword) {
      if (err) {
        console.error("Error checking existing password category:", err);
        return next(err);
      }

      if (existingPassword) {
        // Handle the case where the password category already exists
        return res.render("addNewPassword", {
          title: "Password Management System",
          LoginUser: LoginUser,
          records: [], // You might want to fetch and pass actual records here
          errors: "Password Category Already Exists.",
          success: "",
        });
      }

      var passwordDetails = new passModule({
        password_category: pass_cat,
        project_name: project_name,
        password_details: pass_details,
      });

      passwordDetails.save(function (err, doc) {
        if (err) {
          console.error("Error saving password details:", err);
          return next(err);
        }

        console.log("Password details saved successfully:", doc);

        passCatModule.find({}, function (err, data) {
          if (err) {
            console.error("Error fetching password categories:", err);
            return next(err);
          }

          console.log("Fetched password categories:", data);

          res.render("addNewPassword", {
            title: "Password Management System",
            LoginUser: LoginUser,
            records: data,
            errors: "",
            success: "Password Details Inserted Successfully.",
          });
        });
      });
    }
  );
});

module.exports = router;
