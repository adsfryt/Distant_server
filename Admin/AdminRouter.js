import Router from 'express'
import bcrypt from "bcryptjs";
import TestFull from "../api_s/TestFull.js";
import Test from "../api/Test.js";
import TestAccessRouter from "../Test_access/TestAccessRouter.js";

const admin = new Router();
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
admin.get('/get_All',  async (req, res)=>{
    try{
        var Access = await TestAccessRouter.find({"testId" : req.query.testId});
        var password = Access[0].password;
        var isEquals = await bcrypt.compare(req.query.password, password);
        if(isEquals){
            var post = (await Test.find({"testId" : req.query.testId}))[0];
            var post_full = (await TestFull.find({"testId" : req.query.testId}))[0];
            return res.json({post, post_full});
        }else{
            return res.json("not found");
        }

    }
    catch (e) {
        res.status(500).json(e);
    }});
admin.put('/add_passed',  async (req, res)=>{
    try{
        const data = req.body;
        const response = await TestFull.find({testId: data.testId});
        const response1 = await Test.find({testId: data.testId});
        if (!response) {
            res.status(400);
        }


        var Access = await TestAccessRouter.find({"testId" : data.testId});
        var password = Access[0].password;
        var isEquals = await bcrypt.compare(data.password, password);
        if(isEquals) {
            for (let y = 0; y <data.urlGuests.length; y++) {

                var test = response[0];
                var tests = response1[0];
                var isExist = false
                for (var i = 0; i < test.passed.length; i++) {
                    if (test.passed[i][0] === data.urlGuests[y]) {
                        isExist = true;
                        break;
                    }
                }

                var endDate_sh;
                for (var i1 = 0; i1 < test.started.length; i1++) {
                    if (test.started[i1][0] === data.urlGuests[y]) {
                        let date = new Date(test.started[i1][1]);
                        endDate_sh = new Date(date.getTime() + (tests.timeS * 1000));
                        break;
                    }
                }

                if (!isExist) {
                    var date = new Date();
                    var urlg = await fetch(`http://localhost:5000/api_s/ifExist_g?testId=` + data.testId + `&` + `urlGuests=` + data.urlGuests);
                    var url_g = await urlg.json();

                    var urls = await fetch(`http://localhost:5000/api_s/ifExist_s?testId=` + data.testId + `&` + `urlGuests=` + data.urlGuests);
                    var url_s = await urls.json();

                    if (url_g && url_s && endDate_sh.getTime() <= date.getTime()) {
                        date = endDate_sh;
                        const updated1 = await TestFull.updateOne({_id: test._id}, {$push: {passed: [data.urlGuests[y], date]}});
                        if (tests.showAnswer === 1 || tests.showAnswer === 2 || tests.showAnswer === 3 || tests.showAnswer === 4) {
                            var get_userAnswer = await fetch("http://localhost:5000/api_s/get_userAnswer?testId=" + data.testId + "&urlGuests=" + data.urlGuests)
                            var get_userAnswer_j = await get_userAnswer.json();

                            var check_test = await fetch("http://localhost:5000/api_s/check_test", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify(get_userAnswer_j)
                            })

                            var check_test_j = await check_test.json();

                            var updated = await TestFull.findOneAndUpdate(
                                {_id: test._id, userResult: {$elemMatch: {URLs: data.urlGuests[y]}}},
                                {
                                    $set: {
                                        "userResult.$[c].answer": check_test_j,
                                        "userResult.$[c].final": 1
                                    },
                                }, {
                                    arrayFilters: [
                                        {
                                            "c.URLs": data.urlGuests[y]
                                        }
                                    ]
                                }
                            );
                        }

                    }

                }
            }
        }

        return res.json("")
    }
    catch (e) {
        res.status(500).json(e);
    }});
admin.put('/add_link',  async (req, res)=>{
    try {

        const data = req.body;
        var Access = await TestAccessRouter.find({"testId" : data.testId});
        var password = Access[0].password;

        var isEquals = await bcrypt.compare(data.password, password);
        if (isEquals) {

            const responses = await Test.find({testId: data.testId});
            const response = await TestFull.find({testId: data.testId});
            if (!response) {
                res.status(400);
            }

            var test = response[0];
            var tests = responses[0];

            var curDate = new Date();
            var endDate = new Date(tests.endTime);

            if (endDate.getTime() > curDate.getTime()) {

                var isFree = 0;
                var id;
                while (!isFree) {
                    id = createUserId(11);
                    isFree = 1;

                    for (var i = 0; i < test.urlGuests.length; i++) {
                        if (test.urlGuests[i][0] === id) {
                            isFree = 0;
                            break;
                        }
                    }
                }

                const updated = await TestFull.updateOne({_id: test._id}, {$push: {urlGuests: [id, data.name]}});
                return res.json(id);
            }

        }
    }
    catch (e) {
        res.status(500).json(e);
    }});
admin.post('/add_result',  async (req, res)=>{
    try {

        const {password, URLs, result, testId} = req.body;
        var Access = await TestAccessRouter.find({"testId" :testId});
        var password_h = Access[0].password;

        var isEquals = await bcrypt.compare(password, password_h);
        if (isEquals) {

            const response = await TestFull.find({testId: testId});
            if (!response) {
                res.status(400);
            }

            var userResultID;
            for (let j = 0; j < response[0].userResult.length; j++) {
                if (response[0].userResult[j].URLs === URLs){
                    userResultID = response[0].userResult[j];
                    break;
                }
            }

            console.log(response[0].userResult, URLs);
            for (let i = 0; i < result.length; i++) {

                var isExist = false;
                for (let j = 0; j < userResultID.answer.length; j++) {
                    if(result[i].id === userResultID.answer[j].id){
                        isExist = true;
                    }
                }
                console.log(isExist)
                if(isExist){
                    console.log("vvv" + i)
                var updated = await TestFull.findOneAndUpdate(
                    {
                        _id: response[0]._id,
                        userResult: {$elemMatch: {URLs: URLs, answer: {$elemMatch: {id: result[i].id}}}}
                    },
                    {
                        $set: {"userResult.$[c].answer.$[d].result": result[i].result,
                            "userResult.$[c].answer.$[d].Idmax": result[i].Idmax,
                            "userResult.$[c].answer.$[d].final": result[i].final,},

                    }, {
                        arrayFilters: [
                            {
                                "c.URLs": URLs
                            },
                            {
                                "d.id": result[i].id
                            }
                        ]
                    }
                );
                    console.log("vvv" + i)
                }else {

                    const updated = await TestFull.updateOne({
                        _id: response[0]._id,
                        "userAnswer.URLs": URLs
                    }, {$push: {'userResult.$.answer': result[i]}});
                }
            }
            return res.json("ok")
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});

export default admin;