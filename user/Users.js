import mongoose from "mongoose"


const User = new mongoose.Schema({
    email:{type:String, unique:true, required:true},
    password:{type:String, required:true},
    isActivated:{type:Boolean, required:true},
    linkActivatinon:{type:String, required:true},
    name:{type:String, required:true},
    surname:{type:String, required:true},
    nickname:{type:String, required:true}
})



export default mongoose.model("User",User)