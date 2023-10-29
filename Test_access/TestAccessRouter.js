import mongoose from "mongoose"

const TestAccess = new mongoose.Schema({
    password:{type: String, required:true},
    testId:{type: String, required:true, unique:true},
});

export default mongoose.model("TestAccess",TestAccess)