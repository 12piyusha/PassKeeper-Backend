const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/Passwords", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // useCreateIndex:true,
});
var db = mongoose.connection;
var passSchema = new mongoose.Schema({
  password_category: {
    type: String,
    required: true,
    index : {
      unique:true,
    }
  },
  project_name: {
    type: String,
    required: true,
  },
  password_details: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});
passSchema.plugin(mongoosePaginate);
var passModel = mongoose.model("password_details", passSchema);
// var user1 =new userModel({
//     username:"piyusha12",
//     email:"piyusha.bhadange@gmail.com",
//     password:1234,
// })
db.on("connected", function () {
  console.log("Connected to Mongodb Successfully.");
});
db.on("disconnecetd", function () {
  console.log("Disconnected to Mongodb Succesfuuly");
});
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function () {
  //    user1.save(function(err,user1){
  //     if(err) console.log(err.message);
  //     console.log("Employee data is saved succesully.");
  //    })
});

module.exports = passModel;
