import Router from 'express'
import Test from "./Test.js";
import TestAccess from "../Test_access/TestAccessRouter.js";
import Tests from "../api_s/TestFull.js";
import bcrypt from "bcryptjs";

const router = new Router();

function createUserId(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
function Chech_post(body){
    var error = {ok:true, error_list:[]};
    if(body.title === "" || body.title === undefined){
        error.ok = false;
        error.error_list.push([0,"Введите название"])
    }
    if(body.description === "" || body.description === undefined){
        error.ok = false;
        error.error_list.push([1,"Введите описание"])
    }
    if(body.startTime === undefined){
        error.ok = false;
        error.error_list.push([2,"Введите дату начала"])
    }
    if(body.endTime === undefined){
        error.ok = false;
        error.error_list.push([3,"Введите дату окончания"])
    }
    var start_date = new Date(body.startTime)
    var end_date = new Date(body.endTime)
    var cur_date = new Date()
    if(start_date.getTime() >= end_date.getTime()){
        error.ok = false;
        error.error_list.push([4,"Дата начала должна быть раньше даты окончания"])
    }

    if(start_date.getTime() <= cur_date.getTime()){
        error.ok = false;
        error.error_list.push([5,"Дата начала не может быть позже сегодняшней даты"])
    }
    if(end_date.getTime() <= cur_date.getTime()){
        error.ok = false;
        error.error_list.push([6,"Дата окончания не может быть позже сегодняшней даты"])
    }
    if(body.author === "" || body.author === undefined){
        error.ok = false;
        error.error_list.push([7,"Введите имя"])
    }
    if(body.strickMode === "" || body.strickMode === undefined){
        error.ok = false;
        error.error_list.push([8,"Выберите strickMode"])
    }
    if(body.saveAnswer === "" || body.saveAnswer === undefined){
        error.ok = false;
        error.error_list.push([9,"Введите saveAnswer"])
    }
    if(body.editAnswer === "" || !body.editAnswer === undefined){
        error.ok = false;
        error.error_list.push([10,"Введите editAnswer"])
    }
    if(body.tests === undefined || body.tests.length === 0){
        error.ok = false;
        error.error_list.push([11,"Создайте хоть 1 задание"])
    }
    return error;
}

router.post('/post_test',  async (req, res)=>{
    try{

        const {title, description, author, strickMode, saveAnswer, editAnswer, showAnswer,startTime, endTime, timeS, tests, answer, publicMode} = req.body;
        var body = req.body;

        var errors = Chech_post(body);
        if (errors.error_list.length !== 0){
            return res.json({ok:false,error:errors.error_list});
        }

        var addTime = Date.now();
        var password_gen = createUserId(20);
        var password = await bcrypt.hash(password_gen,2);
        var testId;
        var isNotId_unic = true;

        while (isNotId_unic){
            testId = createUserId(5) + "-" + createUserId(5) + "-" + createUserId(6);
            var posts_in = await Test.find({"testId" : testId});
            if(posts_in[0] === undefined){
                isNotId_unic = false;
            }
        }

        var post_ac = await TestAccess.create({password, testId});
        var post = await Test.create({testId, title, description, author, strickMode, saveAnswer, publicMode, editAnswer, showAnswer, addTime,
            startTime, endTime, timeS, tests});
        console.log("e")
        var post_p = await fetch("http://localhost:5000/api_s/post_test",{
            method:"POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({answer, testId})
        })

        return res.json({ok:true,password:password_gen,testId:testId});
}
    catch (e) {
        res.status(500).json(e);
}});

router.get('/get_test',  async (req, res)=>{
    try{
        const post = await Test.find({"testId" : req.query.testId});
        const tests = await Tests.find({"testId" : req.query.testId});

        var started = 0;
        var maxstartTime;
        var curDate = (new Date()).getTime();
        for (var i = 0; i < tests[0].started.length; i++) {
            if (tests[0].started[i][0] === req.query.urlGuests) {

                maxstartTime = (new Date(tests[0].started[i][1])).getTime() + (post[0].timeS*1000)
                break;
            }
        }

        if(post[0] && maxstartTime > curDate) {

                res.json(post[0]);

        }else{
            res.json([]);
        }
    }
    catch (e) {
        res.status(500).json(e);
}});
router.get('/get_test_name',  async (req, res)=>{
    try{
        var post = await Test.find({"testId" : req.query.testId});
        var test = await post[0];

        var tests = await Tests.find({"testId" : req.query.testId});
        test.tests = undefined;

        var isExist = false;
        for (var i = 0; i < tests[0].urlGuests.length; i++) {
            if (tests[0].urlGuests[i][0] === req.query.urlGuests) {
                isExist = true;
                break;
            }
        }


        if(isExist) {
            res.json(test);
        }else{
            res.json([]);
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});
router.get('/get_test_after',  async (req, res)=>{
    try{
        const post = await Test.find({"testId" : req.query.testId});
        const tests = await Tests.find({"testId" : req.query.testId});
        var isExist = 0;
        for (var i = 0; i < tests[0].passed.length; i++) {
            console.log("gg")
            if (tests[0].passed[i][0] === req.query.urlGuests) {
                isExist = 1;
                break;
            }
        }
        if(isExist) {
            if (post[0].showAnswer === 1 && post[0].showAnswer === 0) {

                return res.json(post[0]);
            } else if (post[0].showAnswer === 2) {
                if ((new Date(post[0].endTime)) < new Date()) {
                    return res.json(post[0]);
                } else {
                    var test = post[0];
                    delete test.tests;
                    return res.json(test);
                }
            } else {
                var test = post[0];
                delete test.tests;
                return res.json(test);
            }
        }
        else {
            return res.json("");
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});
router.get('/get_test_n',  async (req, res)=>{
    try{
        const post = await Test.find({"testId" : req.query.testId});

        var {testId, title, description,urlGuests, started,passed,author,language,
            currentLanguage,strickMode, publicResult,saveAnswer, editAnswer, showAnswer, pageTest, attempts, addTime,
            startTime, endTime, timeS} = post[0];

        var test = {testId, title, description,urlGuests, started,passed,author,language,
            currentLanguage,strickMode, publicResult,saveAnswer, editAnswer, showAnswer, pageTest, attempts, addTime,
            startTime, endTime, timeS};

        if(post[0]) {
            if(post[0].publicMode === 1) {
            res.json(test);
            }else{
                res.json([]);
            }
        }else{
            res.json([]);
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});

router.get('/get_test_students',  async (req, res)=>{
    try{
        const post = await Test.find(req.query);
        res.json(post[0].testId);
    }
    catch (e) {
        res.status(500).json(e);
    }});


// router.put('/add_link',  async (req, res)=>{
//     try{
//         const data = req.body;
//
//         var response = await fetch(`http://localhost:5000/api/get_test?testId=`+ data.testId);
//         var test = await response.json();
//         if (!test._id){
//             req.status(400);
//         }
//         var isFree = 0;
//         var id;
//         while(!isFree){
//             id = createUserId(11);
//             isFree = 1;
//             for (var i = 0; i < test.urlGuests.length; i++) {
//                 if (test.urlGuests[i][0] === id) {
//                     isFree = 0;
//                     break;
//                 }
//             }
//         }
//
//         const updated = await Test.updateOne({_id:test._id}, {$push: { urlGuests: [id,"hhhhh"] }});
//         return res.json("gh");
//     }
//     catch (e) {
//         res.status(500).json(e);
//     }}
// );

export default router;