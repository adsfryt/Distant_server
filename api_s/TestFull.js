import mongoose from "mongoose"

const TestFull = new mongoose.Schema({
    testId:{type: String, required:true},
    urlGuests:[[{type: mongoose.Schema.Types.Mixed}]],
    started:[[{type: mongoose.Schema.Types.Mixed}]],
    passed:[[{type: mongoose.Schema.Types.Mixed}]],
    answer:[{type: mongoose.Schema.Types.Mixed}],
    userAnswer:[{type: mongoose.Schema.Types.Mixed}],
    userResult:[{type: mongoose.Schema.Types.Mixed}],
})



export default mongoose.model("TestFull",TestFull)