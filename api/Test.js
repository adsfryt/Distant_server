import mongoose from "mongoose"

const Test = new mongoose.Schema({
    testId:{type: String, required:true, unique:true},
    title:{type: String, required:true},
    description:{type: String, required:true},
    author: {type: String, required:true},
    // currentLanguage:{type: String},
    // language:[{type: String}],
    // isPaused:{type:  Number, min: 0, max: 1},
    publicMode:{type:  Number, min: 0, max: 1, required:true},
    strickMode:{type:  Number, min: 0, max: 1, required:true},
    // publicResult:{type:  Number, min: 0, max: 1, required:true},
    saveAnswer:{type:  Number, min: 0, max: 1, required:true},
    editAnswer:{type:  Number, min: 0, max: 1, required:true},
    showAnswer:{type:  Number, min: 0, max: 4, required:true},
    // pageTest:{type:  Number, min: 0, max: 1},
    // attempts:{type:  Number, min: 1},
    addTime: {type:  Date, required:true},
    startTime: {type:  Date, required:true},
    endTime:{type:  Date, required:true},
    timeS:{type:  Number, required:true},
    tests:[{type: mongoose.Schema.Types.Mixed}],
})



export default mongoose.model("Test",Test)