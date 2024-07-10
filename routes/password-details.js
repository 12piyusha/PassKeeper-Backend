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

router.post("/edit/", function (req, res, next) {
    var LoginUser = localStorage.getItem("LoginUser");
    var passCatId = req.body.id;
    var passwordCategory = req.body.passwordCategory;
    var update_passCat = passCatModule.findByIdAndUpdate(passCatId, {
      password_category: passwordCategory,
    });
  
    update_passCat.exec(function (err, doc) {
      if (err) throw err;
      res.redirect("/passwordCategory");
    });
  });
  
  router.get("/", checkLoginUser, function (req, res, next) {
    res.redirect("dashboard");
  });
  
  router.get(
    "/edit/:id",
    checkLoginUser,
    function (req, res, next) {
      var LoginUser = localStorage.getItem("LoginUser");
      var id = req.params.id;
  
      var getPassDetail = passModule.findById({ _id: id });
  
      getPassDetail.exec(function (err, data) {
        if (err) {
          console.error("Error checking existing password category:", err);
          return next(err);
        } else {
          getAllPass.exec(function (err, data1) {
            res.render("EditPasswordDetails", {
              title: "Password Management System",
              LoginUser: LoginUser,
              records: data1,
              record: data,
              success: "",
              errors: "",
            });
          });
        }
      });
    }
  );
  router.post(
    "/edit/:id",
    checkLoginUser,
    function (req, res, next) {
      var LoginUser = localStorage.getItem("LoginUser");
      var id = req.params.id;
      var passcat = req.body.pass_cat;
      var NewProjectName = req.body.new_project_name;
      var NewPassDetails = req.body.new_pass_details;
  
      passModule
        .findByIdAndUpdate(
          { _id: id },
          {
            password_category: passcat,
            project_name: NewProjectName,
            password_details: NewPassDetails,
          }
        )
        .exec(function (err) {
          if (err) {
            console.error("Error Editing password details:", err);
            return next(err);
          } else {
            var getPassDetail = passModule.findById({ _id: id });
  
            getPassDetail.exec(function (err, data) {
              if (err) {
                console.error("Error checking existing password category:", err);
                return next(err);
              } else {
                getAllPass.exec(function (err, data1) {
                  res.render("EditPasswordDetails", {
                    title: "Password Management System",
                    LoginUser: LoginUser,
                    records: data1,
                    record: data,
                    success: "",
                    errors: "",
                  });
                });
              }
            });
          }
        });
    }
  );
  
  router.get("/delete/:id", function (req, res, next) {
    var LoginUser = localStorage.getItem("LoginUser");
    var id = req.params.id;
  
    var passDelete = passModule.findByIdAndDelete(id);
    passDelete.exec(function (err) {
      if (err) throw err;
      res.redirect("/ViewAllPassword");
    });
  });
module.exports = router;
