import express from "express"
import mongoose from "mongoose"
import router from "./api/router.js"
import tests from "./api_s/Tests.js"
import Test from "./api/Test.js";
const PORT = 5000;
const db_url = "mongodb+srv://asanosmanov217:TO8GHhhUuiuXbGCF@distant.vpiu8rm.mongodb.net/";
import WebSocket from "ws";
import WSserver from "express-ws";
import cookieParser from "cookie-parser";
import user from "./user/RouterUser.js";
import cors from "cors";
import admin from "./Admin/AdminRouter.js";
const app = express();
WSserver(app);

app.use(function(req, res, next) {
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    // res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});
app.use(cors({
    credentials: true,
}))
app.use(express.json({extended: true}));
app.use(cookieParser())
app.use('/api', router);
app.use('/api_s', tests);
app.use('/user',user)
app.use('/admin', admin)
// app.use('/user', tests);

async function start(){
    try{
        await mongoose.connect(db_url, {useUnifiedTopology: true, useNewUrlParser: true});
        app.listen(PORT, () => console.log('SERVER STARTED ON PORT ' + PORT));

        setInterval(async ()=> {
            const test = await Test.find();
            for (var i = 0; i < test.length; i++) {
                var now = new Date();
                var millisTill10 = (new Date(test[i].endTime)).getTime() - now.getTime();
                if(millisTill10 < 60000){
                    await fetch("http://localhost:5000/api_s/set_allPassed",{
                        method:"POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({testId:test[i].testId})
                    })
                }
            }
        },60000)
    }catch (e) {
        console.log(e)
    }
}
start();





