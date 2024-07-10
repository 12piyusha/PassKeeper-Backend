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

/* GET home page. */

router.get("/", function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");
  if (LoginUser) {
    res.redirect("/dashboard");
  } else {
    res.render("index", { title: "Password Management System", msg: "" });
  }
});

router.get("/signup", function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");
  if (LoginUser) {
    res.redirect("/dashboard");
  } else {
    res.render("signup", { title: "Password Management System", msg: "" });
  }
});

//POST MTEHODS
//post function to credentails for login
router.post("/", function (req, res, next) {
  //Details get by user for login
  var username = req.body.uname;
  var password = req.body.password;

  //check if username is present in the database or not.
  var checkUser = userModule.findOne({ username: username });

  checkUser.exec((err, data) => {
    //if username is not present in databse then it will throw an error.
    if (err) throw err;
    // if username is present then it will get password corresponding to that username in encrypted format.
    var getUserId = data._id;
    var getpassword = data.password;
    // bcrypt.compareSync() this function will compare the password enter by user for login and encrypted password presnt int he databse.If it is matched then it go to login page with login succesful message otherwise iit shows message i.e 'Invaild Username and Password.'
    if (bcrypt.compareSync(password, getpassword)) {
      //generating token
      var token = jwt.sign({ userId: getUserId }, "loginToken");
      //storing the token into local storage for login and logout verify purpose.
      localStorage.setItem("UserToken", token);
      localStorage.setItem("LoginUser", username);
      res.redirect("dashboard");
    } else {
      res.render("index", {
        title: "Password Management System",
        msg: "Invaild Username and Password.",
      });
    }
  });
});

router.post("/signup", checkUsername, checkEmail, function (req, res, next) {
  var username = req.body.uname;
  var email = req.body.email;
  var password = req.body.password;
  var cpassword = req.body.cpassword;

  if (password != cpassword) {
    res.render("signup", {
      title: "Passsword Management System",
      msg: "Password Not Matched!",
    });
  } else {
    password = bcrypt.hashSync(req.body.password, 10);
    var userDetails = new userModule({
      username: username,
      email: email,
      password: password,
    });
    console.log(userDetails);
    userDetails.save((err, doc) => {
      if (err) throw err;
      res.render("signup", {
        title: "Passsword Maanagement System",
        msg: "User Regsisterd Successfully.",
      });
    });
  }
});

router.get("/logout", function (req, res, next) {
  localStorage.removeItem("UserToken");
  localStorage.removeItem("LoginUser");
  res.redirect("/");
});

router.get("/view/:id", function (req, res, next) {
  var LoginUser = localStorage.getItem("LoginUser");

  var PassId = req.params.id;
  var PassIdDetails = passModule.findById(PassId);

  PassIdDetails.exec(function (err, data) {
    if (err) {
      console.log("Error Fetching Password.", err);
      return next(err);
    } else {
      console.log("Fetched Data:", data); // Debugging line
      res.render("See_password", {
        title: "Password Management System",
        LoginUser: LoginUser,
        records: data,
      });
    }
  });
});

module.exports = router;
