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

router.get("/", checkLoginUser, async function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");
  
  try {
    var passCatCount = await passCatModule.countDocuments();
    var passCount = await passModule.countDocuments();
    
    console.log(passCatCount);
    console.log(passCount);
    
    res.render("dashboard", {
      title: "Password Management System",
      LoginUser: LoginUser,
      passCatCount: passCatCount,
      passCount: passCount,
    });
  } catch (error) {
    console.error(error);
    next(error); 
  }
});
module.exports = router;
