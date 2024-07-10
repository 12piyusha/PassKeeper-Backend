const mongoose=require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/Passwords',{
    useNewUrlParser :true,
    useUnifiedTopology :true,
    // useCreateIndex:true,
})
var  db=mongoose.connection;
var passcatSchema=new mongoose.Schema({
    password_category:{
        type:String,
        required:true,
        index:{
            unique:true,
        }},

    
    date:{
        type:Date,
        default:Date.now
    }
});
var passCatModel=mongoose.model("password_categories",passcatSchema);
// var user1 =new userModel({
//     username:"piyusha12",
//     email:"piyusha.bhadange@gmail.com",
//     password:1234,
// })
db.on('connected',function(){
    console.log("Connected to Mongodb Successfully.");
})
db.on('disconnecetd',function(){
    console.log("Disconnected to Mongodb Succesfuuly");
})
db.on('error',console.error.bind(console,"connection error"));
db.once('open',function(){
//    user1.save(function(err,user1){
//     if(err) console.log(err.message);
//     console.log("Employee data is saved succesully.");
//    })
})
module.exports=passCatModel;