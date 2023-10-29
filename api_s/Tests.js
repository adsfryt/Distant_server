import Router from 'express'
import Tests from "../api/Test.js";
import Test from "./TestFull.js";
// import fetch from 'node-fetch';
const tests = new Router();

// var data = {
//     testId:"AAAAA-AAAAA-AAAAAS",
//     title:"Test1",
//     description:"This is test!",
//     urlGuests:[["DI2K6PXEKB2","Nikita"],["PUDPPWETQ32","FGe"],["PUSEN4WB36V","SF"]],
//     started:[["PUDPPWETQ32","Wed Jul 12 2023 23:22:17 GMT+0300 (Москва, стандартное время)"],["PUSEN4WB36V","Thu Jul 13 2023 10:31:40 GMT+0300 (Москва, стандартное время)"]],
//     passed:[],
//     author:"64678c05fbdae6e1a3780e4a",
//     currentLanguage:"English",
//     language:["English","Ukranian"],
//     strickMode:0,
//     publicResult:0,
//     saveAnswer:1,
//     editAnswer:1,
//     showAnswer:1,
//     pageTest:0,
//     attempts:1,
//     addTime:1685498400000,
//     startTime:1685152800000,
//     endTime:1690682400000,
//     timeS:600
//
// };
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

function CheckID1(rightAnswer, userAnswer,maxchoice){
    try {
        var Idmax = 0;
        var ResultMax = 0;
        for (var i = 0; i < rightAnswer.answers.length; i++) {
            var maxChoice = maxchoice;
            var points = 0;
            for (var i1 = 0; i1 < userAnswer.answers.length; i1++) {
                var id = userAnswer.answers[i1].ids;
                var answer = userAnswer.answers[i1].answer;
                var isBreak = 0;
                if(maxChoice){
                    for (var i2 = 0; i2 < rightAnswer.answers[i].length; i2++) {
                    if(id === rightAnswer.answers[i][i2].ids){
                        var ranswer = rightAnswer.answers[i][i2].answer;
                        var uSel = rightAnswer.answers[i][i2].underSelection;
                        var uSelf = 0;
                        if (uSel !== "inf"){
                            uSelf = parseFloat(uSel);
                        }

                        var wSel = rightAnswer.answers[i][i2].wrongSelection;
                        var wSelf = 0;
                        if (wSel !== "inf"){
                            wSelf = parseFloat(wSel);
                        }

                        if(answer === 1 && ranswer === 1){
                            maxChoice--;
                            points += rightAnswer.answers[i][i2].points;
                        }
                        else if(answer === 0 && ranswer === 1){
                            if (uSel !== "inf"){
                                points -= uSelf;
                            }
                            else{
                                points = 0;
                                isBreak = 1;

                            }
                        }else if(answer === 1 && ranswer === 0){
                            maxChoice--;
                            if (wSel !== "inf"){
                                points -= wSelf;
                            }
                            else{
                                points = 0;
                                isBreak = 1;
                            }
                        }else if(answer === 0 && ranswer === 0){
                        }
                        break;
                    }
                }
                }
                if(isBreak){
                    break;
                }
            }
            if(points > ResultMax){
                ResultMax = points;
                Idmax = i;
            }
        }
        return {ResultMax: ResultMax,Idmax:Idmax };
    }catch (e) {
        console.log(e)
    }
}
function CheckID2(rightAnswer, userAnswer){
    try {
        var Idmax = 0;
        var ResultMax = 0;
        for (var i = 0; i < rightAnswer.answers.length; i++) {
            var points = 0;
            for (var i1 = 0; i1 < userAnswer.answers.length; i1++) {
                var id = userAnswer.answers[i1].ids;
                var answer = userAnswer.answers[i1].answer;
                for (var i2 = 0; i2 < rightAnswer.answers[i].length; i2++) {
                    if(id === rightAnswer.answers[i][i2].ids){
                        if(answer === rightAnswer.answers[i][i2].answer ) {
                            points += rightAnswer.answers[i][i2].points;
                        }
                        break;
                    }

                }
            }
            if(points > ResultMax){
                ResultMax = points;
                Idmax = i;
            }
        }
        return {ResultMax: ResultMax,Idmax:Idmax };
    }catch (e) {
        console.log(e)
    }
}

tests.post('/post_test',  async (req, res)=>{
    try{
        const {testId, answer} = req.body;
        console.log("///")
        var urlGuests = [];
        var started = [];
        var passed = [];
        var userAnswer = [];
        var userResult = [];
        console.log("///")
        const post = await Test.create({testId, urlGuests, started, passed, answer, userAnswer, userResult});
        // const response = await fetch("http://localhost:5000/api/post_test/", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify(data)
        // });
        console.log("///")
        return res.json(post);

    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.get('/get_time_user',  async (req, res)=>{
    try{
        var start = 0;
        const test = await Test.find({"testId" : req.query.testId});

        for (var i = 0; i < test[0].started.length; i++) {
            if (test[0].started[i][0] === req.query.urlGuests) {
                start = test[0].started[i][1];
                break;
            }
        }
        res.json(start);
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.get('/get_leftTime_user',  async (req, res)=>{
    try{
        var start = 0;
        const test = await Test.find({"testId" : req.query.testId});
        const tests = await Tests.find({"testId" : req.query.testId});
        var maxstartTime;
        var curDate = (new Date()).getTime()
        for (var i = 0; i < test[0].started.length; i++) {
            if (test[0].started[i][0] === req.query.urlGuests) {

                maxstartTime = (new Date(test[0].started[i][1])).getTime() + (tests[0].timeS*1000)
                break;
            }
        }

        if(maxstartTime <= curDate) {
            res.json(-1);
        }else{
            res.json(maxstartTime-curDate);
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});

tests.get('/get_time',  async (req, res)=>{
    try{
        var date = Date.now();
        res.json(date);
    }
    catch (e) {
        res.status(500).json(e);
    }});
tests.get('/ifExist_g',  async (req, res)=>{
    try{
        var isExist = 0;
        const test = await Test.find({"testId" : req.query.testId});

        for (var i = 0; i < test[0].urlGuests.length; i++) {
            if (test[0].urlGuests[i][0] === req.query.urlGuests) {
                isExist = 1;
                break;
            }
        }
        res.json(isExist);
    }
    catch (e) {
        res.status(500).json(e);
    }});
tests.get('/get_name_g',  async (req, res)=>{
    try{
        var name = "";
        const test = await Test.find({"testId" : req.query.testId});

        for (var i = 0; i < test[0].urlGuests.length; i++) {
            if (test[0].urlGuests[i][0] === req.query.urlGuests) {
                name = test[0].urlGuests[i][1];
                break;
            }
        }
        res.json(name);
    }
    catch (e) {
        res.status(500).json(e);
    }});
tests.get('/ifExist_s',  async (req, res)=>{
    try{
        var isExist = 0;
        const test = await Test.find({"testId" : req.query.testId});

        for (var i = 0; i < test[0].started.length; i++) {
            if (test[0].started[i][0] === req.query.urlGuests) {
                isExist = 1;
                break;
            }
        }
        res.json(isExist);
    }
    catch (e) {
        res.status(500).json(e);
    }});
tests.get('/ifExist_p',  async (req, res)=>{
    try{
        var isExist = 0;
        const test = await Test.find({"testId" : req.query.testId});

        for (var i = 0; i < test[0].passed.length; i++) {
            if (test[0].passed[i][0] === req.query.urlGuests) {
                isExist = 1;
                break;
            }
        }
        res.json(isExist);
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.put('/add_passed',  async (req, res)=>{
    try{
        const data = req.body;
        const response = await Test.find({testId: data.testId});
        const response1 = await Tests.find({testId: data.testId});
        if (!response) {
            res.status(400);
        }
        var test = response[0];
        var tests = response1[0];
        var isExist = 0;
        for (var i = 0; i < test.passed.length; i++) {
            if (test.passed[i][0] === data.urlGuests) {
                isExist = 1;
                break;
            }
        }

        var endDate_sh;
        for (let i = 0; i < test.started.length; i++) {
            if (test.started[i][0] === data.urlGuests) {
                endDate_sh = new Date((new Date(test.started[i][1])).getTime() + (tests.timeS*1000));
                break;
            }
        }

        console.log(isExist)
        if(!isExist) {
            var date = new Date();
            if(endDate_sh <= date){
                date = endDate_sh;
            }
            var urlg = await fetch(`http://localhost:5000/api_s/ifExist_g?testId=` + data.testId + `&` + `urlGuests=` + data.urlGuests);
            var url_g = await urlg.json();

            var urls = await fetch(`http://localhost:5000/api_s/ifExist_s?testId=` + data.testId + `&` + `urlGuests=` + data.urlGuests);
            var url_s = await urls.json();
            if (url_g && url_s) {
                const updated1 = await Test.updateOne({_id: test._id}, {$push: {passed: [data.urlGuests, date]}});
                if(tests.showAnswer === 1 || tests.showAnswer === 2 || tests.showAnswer === 3 || tests.showAnswer === 4) {
                    var get_userAnswer = await fetch("http://localhost:5000/api_s/get_userAnswer?testId=" + data.testId + "&urlGuests=" + data.urlGuests)
                    var get_userAnswer_j = await get_userAnswer.json();
                    console.log(get_userAnswer_j)

                    var check_test = await fetch("http://localhost:5000/api_s/check_test", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(get_userAnswer_j)
                    })

                    var check_test_j = await check_test.json();

                    var updated = await Test.findOneAndUpdate(
                        {_id: test._id, userResult: {$elemMatch: {URLs: data.urlGuests}}},
                        {
                            $set: {"userResult.$[c].answer": check_test_j,
                                "userResult.$[c].final": 1},
                        }, {
                            arrayFilters: [
                                {
                                    "c.URLs": data.urlGuests
                                }
                            ]
                        }
                    );
                }
                return res.json(data.urlGuests);
            } else {
                return res.json("error");
            }
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.put('/add_link',  async (req, res)=>{
    try{
        const data = req.body;
        const responses = await Tests.find({testId: data.testId});
        const response = await Test.find({testId: data.testId});
        if (!response) {
            res.status(400);
        }
        var test = response[0];
        var tests = responses[0];

        var curDate = new Date();
        var endDate = new Date(tests.endTime);
        if(endDate.getTime() > curDate.getTime()) {
            var isFree = 0;
            var id;
            if (data.urlGuests === "d") {
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
                var date1 = new Date();
                const updated = await Test.updateOne({_id: test._id}, {$push: {urlGuests: [id, data.name]}});
                const updated1 = await Test.updateOne({_id: test._id}, {$push: {started: [id, date1]}});
                const updated2 = await Test.updateOne({_id: test._id}, {$push: {userAnswer: {URLs:id, answer:[]}}});
                const updated3 = await Test.updateOne({_id: test._id}, {$push: {userResult: {URLs:id, answer:[]}}});
                return res.json(id);
            }else{
                var urlg = await fetch(`http://localhost:5000/api_s/ifExist_g?testId=`+ data.testId + `&` + `urlGuests=` + data.urlGuests);
                var url_g = await urlg.json();
                if(url_g) {
                    id = data.urlGuests;
                    var date = new Date();

                    const updated1 = await Test.updateOne({_id: test._id}, {$push: {started: [id, date]}});
                    const updated2 = await Test.updateOne({_id: test._id}, {$push: {userAnswer: {URLs:id, answer:[]}}});
                    const updated3 = await Test.updateOne({_id: test._id}, {$push: {userResult: {URLs:id, answer:[]}}});
                    return res.json(id);
                }else {
                    return res.json("no");
                }

            }

        }
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.post('/check_test',  async (req, res)=>{
    try{
        const data = req.body;
        const Fulltest = await Test.find({testId: data.testId});
        const test = await Tests.find({testId: data.testId});
        var FullTest = Fulltest[0];
        var NTest = test[0];
        var curDate = new Date();
        var startdate;
        var Results = [];
        var Result = 0;
        for (var i = 0; i < FullTest.started.length; i++) {
            if (FullTest.started[i][0] === data.URLs){
                startdate = FullTest.started[i][1];
                break;
            }
        }
        if(startdate !== undefined){
            var startDate = new Date(startdate);
            var maxDate1 = new Date(startDate.getTime() + (NTest.timeS*1000));
            var endDate = new Date(NTest.endTime);

            if(FullTest.answer[0] !== undefined) {
                for (var i = 0; i < data.answer.length; i++) {
                    var id = data.answer[i].id;
                    var type = data.answer[i].type;
                    var Task;
                    var NTasks;
                    for (var i1 = 0; i1 < FullTest.answer.length; i1++) {
                        if (FullTest.answer[i1].id === id && FullTest.answer[i1].type === type) {
                            Task = FullTest.answer[i1];
                            break;
                        }
                    }
                    for (var i2 = 0; i2 < NTest.tests.length; i2++) {
                        if (NTest.tests[i2].id === id && NTest.tests[i2].type === type) {
                            NTasks = NTest.tests[i2];
                            break;
                        }
                    }
                    if (Task !== undefined && FullTest.answer[i1].check === 1) {
                        switch (data.answer[i].type) {
                            case 1: {
                                let Check = CheckID1(Task, data.answer[i], NTasks.maxChoice);
                                var b = {id: FullTest.answer[i1].id,
                                        result:Check.ResultMax,
                                        Idmax:Check.Idmax,
                                        final: 1
                                };

                                Results.push(b);
                                break;
                            }
                            case 2: {
                                let Check = CheckID2(Task, data.answer[i], NTasks.maxChoice);
                                var b = {id: FullTest.answer[i1].id,
                                    result:Check.ResultMax,
                                    Idmax:Check.Idmax,
                                    final: 1
                                };
                                Results.push(b);
                                break;
                            }
                        }
                    }else if(FullTest.answer[i1].check === 0){
                        var b = {id: FullTest.answer[i1].id,
                            result:0,
                            final:0
                        };
                        Results.push(b);
                    }

                }
                return res.json(Results)

            }else{

               return res.json("no answer");
            }

        }else{

            return res.json("no user");
        }

    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.post('/save_userAnswer',  async (req, res)=>{
    try{
        const {testId, URLs, answer} = req.body;
        const Fulltests = await Test.find({testId: testId});
        const {timeS, endTime} = (await Tests.find({testId: testId}))[0];
        var Fulltest = Fulltests[0];
        var isExist = 0;
        var id;
        for(var i = 0; i < Fulltest.userAnswer.length; i++) {
            if(Fulltest.userAnswer[i].URLs ===URLs) {
                isExist = 1;
                id = i;
                break;
            }
        }
        var curDate = new Date();
        var startdate;

        for (var i = 0; i < Fulltest.started.length; i++) {
            if (Fulltest.started[i][0] === URLs){
                startdate = Fulltest.started[i][1];
                break;
            }
        }


        var startDate = new Date(startdate);
        var maxDate1 = new Date(startDate.getTime() + (timeS*1000));
        var endDate = new Date(endTime);

        if(maxDate1.getTime() > curDate.getTime() && endDate.getTime()+7000 > curDate.getTime()) {
            if (isExist) {

                for (let i1 = 0; i1 < answer.length; i1++) {
                    var isExistT = 0;
                    for (var i = 0; i < Fulltest.userAnswer[id].answer.length; i++) {
                        if (Fulltest.userAnswer[id].answer[i].id === answer[i1].id) {
                            isExistT = 1;
                            break;
                        }
                    }
                    if (isExistT) {
                        var updated = await Test.findOneAndUpdate(
                            {
                                _id: Fulltest._id,
                                userAnswer: {$elemMatch: {URLs: URLs, answer: {$elemMatch: {id: answer[i1].id}}}}
                            },
                            {
                                $set: {"userAnswer.$[c].answer.$[d].answers": answer[i1].answers},
                                $inc: {"userAnswer.$[c].answer.$[d].attempts": 1}
                            }, {
                                arrayFilters: [
                                    {
                                        "c.URLs": URLs
                                    },
                                    {
                                        "d.id": answer[i1].id
                                    }

                                ]
                            }
                        );

                    } else {

                        answer[i1].attempts = 1;

                        const updated = await Test.updateOne({
                            _id: Fulltest._id,
                            "userAnswer.URLs": URLs
                        }, {$push: {'userAnswer.$.answer': answer[i1]}});
                    }
                }
            }
        }else {
            return res.json("time error")
        }
        return res.json("ok")
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.get('/get_userAnswer',  async (req, res)=>{
    try{

        const Fulltests = await Test.find({"testId" : req.query.testId});
        var Fulltest =  Fulltests[0];
        var answer = "no";
        for (var i = 0; i < Fulltest.userAnswer.length; i++) {
            if (Fulltest.userAnswer[i].URLs === req.query.urlGuests){
                answer = Fulltest.userAnswer[i];
                break;
            }
        }
        answer.testId = req.query.testId;
        return res.json(answer)
    }
    catch (e) {
        res.status(500).json(e);
    }});
//user check
tests.get('/get_userResult',  async (req, res)=>{
    try{

        const Fulltests = await Test.find({"testId" : req.query.testId});
        const tests = await Tests.find({"testId" : req.query.testId});
        var Fulltest =  Fulltests[0];
        var test =  tests[0];
        var answer = "no";
        var id;
        for (let i = 0; i < Fulltest.userResult.length; i++) {
            if (Fulltest.userResult[i].URLs === req.query.urlGuests){
                answer = Fulltest.userResult[i];
                id = i;
                break;
            }
        }
        if(test.showAnswer === 1 || test.showAnswer === 3 || test.showAnswer === 0) {
            if (answer.final === 1) {
                return res.json(answer)
            } else {
                return res.json("no answer yet")
            }
        }else if(test.showAnswer === 2){                      // протестировать полностью
            if((new Date()) > (new Date(test.endTime))) {
                if (answer.final === 1) {
                    return res.json(answer)
                } else {
                    return res.json("no answer yet")
                }
            } else {
                return res.json("no answer yet")
            }
        }else{
            return res.json("no answer yet")
        }
    }
    catch (e) {
        res.status(500).json(e);
    }});

tests.get('/get_Answer_after',  async (req, res)=>{
    try{

        const Fulltests = await Test.find({"testId" : req.query.testId});
        const tests = await Tests.find({"testId" : req.query.testId});

        var Fulltest =  Fulltests[0];
        var test =  tests[0];
        var answer;
        var isExist = 0;

        for (let i = 0; i < Fulltest.passed.length; i++) {
            if (Fulltest.passed[i][0] === req.query.urlGuests) {
                isExist = 1;

                break;
            }
        }
        var id;
        for (let i = 0; i < Fulltest.userResult.length; i++) {
            if (Fulltest.userResult[i].URLs === req.query.urlGuests){
                id = i;
                break;
            }
        }

        if(isExist) {
            if (test.showAnswer === 1 || test.showAnswer === 3) {     // протестировать полностью
                return res.json(Fulltest.answer)
            }
            else if (test.showAnswer === 2) {
                if((new Date()) > (new Date(test.endTime))) {
                    return res.json(Fulltest.answer)
                }else{
                    return res.json()
                }
            }
            // else if (test.showAnswer === 3) {
            //     if(Fulltest.userResult[id].final === 0) {
            //         return res.json(Fulltest.answer)
            //     }else{
            //         return res.json("no")
            //     }
            // }
            else{
                return res.json("no")
            }

        }
        else {
            return res.json("no")
        }

        return res.json(answer)
    }
    catch (e) {
        res.status(500).json(e);
    }});
tests.post('/set_allPassed',  async (req, res)=>{  //полностью протестировать нужно
    try{
        const data = req.body;
        const Fulltests = await Test.find({testId: data.testId});
        const tests = await Tests.find({testId: data.testId});
        var test = tests[0];
        var Fulltest = Fulltests[0];
        var Active = [];
        var NowDate = new Date(test.endTime);

        for(var i = 0; i < Fulltest.started.length; i++) {
            var ispassed = 0;
            for (var i1 = 0; i1 < Fulltest.passed.length; i1++) {
                if (Fulltest.started[i][0] === Fulltest.passed[i1][0]) {
                    ispassed = 1;
                    break
                }
            }
            if(!ispassed){
                var maxdate = (new Date(Fulltest.started[i][1])).getTime() + (test.timeS*1000);
                var maxDate = new Date(maxdate)
                if(NowDate >= maxDate){
                    Active.push([Fulltest.started[i][0],maxDate])
                }else{
                    Active.push([Fulltest.started[i][0],NowDate])
                }
            }
        }
        for(var i = 0; i < Active.length; i++) {
            await Test.updateOne({_id: Fulltest._id}, {$push: {passed: Active[i]}});
            if(tests.showAnswer === 1 || tests.showAnswer === 2) {
                var get_userAnswer = await fetch("http://localhost:5000/api_s/get_userAnswer?testId=" + data.testId + "&urlGuests=" + Active[i][0])
                var get_userAnswer_j = await get_userAnswer.json();

                var check_test = await fetch("http://localhost:5000/api_s/check_test", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(get_userAnswer_j)
                })

                var check_test_j = await check_test.json();

                var updated = await Test.findOneAndUpdate(
                    {_id: Fulltest._id, userResult: {$elemMatch: {URLs: Active[i][0]}}},
                    {
                        $set: {"userResult.$[c].answer": check_test_j,
                            "userResult.$[c].final": 1},
                    }, {
                        arrayFilters: [
                            {
                                "c.URLs": Active[i][0]
                            }
                        ]
                    }
                );
            }
        }
        return res.json("ok");
    }
    catch (e) {
        res.status(500).json(e);
    }}); //протестировать
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

export default tests;