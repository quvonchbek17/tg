import { Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, sendCodeDto, verifyCodeDto } from "@middlewares"
import { Auth } from "./auth"

const AuthRouter = Router()

AuthRouter
    .post("/sendcode", validate(sendCodeDto), Auth.SendCode)
    .post("/verifycode", validate(verifyCodeDto), Auth.VerifyCode)
    .get("/generateqr", Auth.generateLoginToken)
    .post("/checkloginqr/:uuid", Auth.checkLoginToken)
    // .post("/verifypassword", Auth.VerifyPassword)

export  {AuthRouter}