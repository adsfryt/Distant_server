import Router from 'express';
import User from "./Users.js"
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Token from "../token/Tokens.js";
import nodemailer from "nodemailer";
import {body, validationResult} from "express-validator";

const user = new Router;

user.post("/registration", body('email').isEmail(), body('password').isLength({min:3, max:50}),body('name').isLength({min:6, max:50}), body('nickname').isLength({min:3, max:50}), body('surname').isLength({min:3, max:50}), async (req, res)=>{
    try {

        var error = validationResult(req);
        console.log(error);
        console.log(req.body);

        if(!error.isEmpty()){
            return res.json("ошибка про проверке")
        }

        var data = req.body;
        var candidate = await User.findOne({email: data.email});
        if (candidate) {
            return res.json("user is already exist");
        }
        var hashPassword = await bcrypt.hash(data.password,2);

        var linkActivatinon = uuidv4();

        var user = await User.create({email:data.email, password: hashPassword, linkActivatinon, isActivated:false, name: data.name, surname: data.surname, nickname:data.nickname})

        var userDto = {email:data.email, id:user._id, isActivated:user.isActivated};
        //
        // var accessToken = jwt.sign({...userDto}, "sdfuyintwefcxbtixdfggjhxcerf", {expiresIn:'30m'})
        // var refreshToken = jwt.sign({...userDto}, "wktnaowereiuthqe-egweviawioeuf", {expiresIn:'30d'})

        // var tokenData = await Token.findOne({user: user._id});
        // if (tokenData){
        //     tokenData.refreshToken = refreshToken;
        //     return res.json("token is exist");
        // }else {
        //     var token = await Token.create({user: userDto.id, refreshToken});
        // }
        // res.cookie('refreshToken',refreshToken,{maxAge:30*86400000, httpOnly:true})

        console.log("registration done");
        var mail = nodemailer.createTransport({
            service: "Outlook365",
            host: "smtp.office365.com",
            port: "587",
            tls: {
                ciphers: "SSLv3",
                rejectUnauthorized: false,
            },
            auth: {
                user:"verifyyourtest@outlook.com",
                pass:"Asaqwed123"
            }
        });
        await mail.sendMail({
            from: "verifyyourtest@outlook.com",
            to:data.email,
            subject: "Activation account:",
            text:"",
            html: `            
            <div>
                <h3>Для активации аккаунта перейдите по ссылке</h3>
                <a href="${"http://localhost:5000/user/submit/" + linkActivatinon}">${"http://localhost:5000/user/submit/" + linkActivatinon}</a>
            </div>
            `
        });

        return res.json({user:userDto})

    }catch (e) {
        console.log(e)
    }
});

user.post("/login", async (req, res)=>{
    try {
        console.log("start")
        var {email, password} = req.body;
        var user = await User.findOne({email})
        if(!user){
            return res.json("not found")
        }

        var isEquals = await bcrypt.compare(password, user.password)
        if(!isEquals){
            return res.json("not found")
        }
        var userDto = {email:user.email, id:user._id, isActivated:user.isActivated};

        var accessToken = jwt.sign({...userDto}, "sdfuyintwefcxbtixdfggjhxcerf", {expiresIn:'30m'})
        var refreshToken = jwt.sign({...userDto}, "wktnaowereiuthqe-egweviawioeuf", {expiresIn:'30d'})

        var tokenData = await Token.findOne({user: user._id});
        if (tokenData){
            tokenData.refreshToken = refreshToken;
            await tokenData.save()
        }else {
            var token = await Token.create({user: userDto.id, refreshToken});
        }

        res.cookie('refreshToken',refreshToken,{maxAge:30*86400000, httpOnly:true});
        return res.json({accessToken, refreshToken, email:user.email, id:user._id, isActivated:user.isActivated});
    }
    catch (e) {

    }
});

user.post("/logout",async (req, res)=>{
    var {refreshToken} = req.cookies;
    var tokenData = await Token.deleteOne({refreshToken});

    res.clearCookie('refreshToken');
    return res.json(tokenData)
});

user.get("/submit/:link", async (req, res)=>{
    try {
        var linkActivatinon = req.params.link;
        var user = await User.findOne({linkActivatinon});
        if (!user){
            return "no link"
        }
        user.isActivated = true;
        await user.save();
        return res.redirect("http://localhost:3000/")
    }
    catch (e) {

    }
});

user.get("/refresh", async (req, res)=>{
    try {
        var {refreshToken} = req.cookies;

        if(!refreshToken){
            return res.json("not found token")
        }

        var refreshData = jwt.verify(refreshToken,"wktnaowereiuthqe-egweviawioeuf");
        var tokenrData = await Token.findOne({refreshToken});

        if(!tokenrData || !refreshData){
            return res.json("not found token in db")
        }
        var user = await User.findById(tokenrData.user);
        var userDto = {email:user.email, id:user._id, isActivated:user.isActivated};

        var accessToken_n = jwt.sign({...userDto}, "sdfuyintwefcxbtixdfggjhxcerf", {expiresIn:'30m'});
        var refreshToken_n = jwt.sign({...userDto}, "wktnaowereiuthqe-egweviawioeuf", {expiresIn:'30d'});

        var tokenData = await Token.findOne({user: user._id});

        if (tokenData){
            tokenData.refreshToken = refreshToken_n;
            await tokenData.save();
        }else {
            var token = await Token.create({user: userDto.id, refreshToken_n});
        }
        res.cookie('refreshToken',refreshToken_n,{maxAge:30*86400000, httpOnly:true});
        console.log("dd")
        return res.json({accessToken:accessToken_n, refreshToken: refreshToken_n,user: user._id});
    }catch (e) {
        console.log(e)
    }
});
user.get("/getMail");

export default user;

// module.exports = function (req, res, next) {
//     try {
//         const authorizationHeader = req.headers.authorization;
//         if (!authorizationHeader) {
//             return res.json("no header")
//         }
//
//         const accessToken = authorizationHeader.split(' ')[1];
//         if (!accessToken) {
//             return  res.json("no token")
//         }
//
//         var accessData = jwt.verify(accessToken,"sdfuyintwefcxbtixdfggjhxcerf");
//         if (!accessData) {
//             return res.json("not valid")
//         }
//
//         next();
//     } catch (e) {
//         res.status(500).json(e);
//     }
// };