import { Router } from "express";
import { validate, updateProfileDto } from "@middlewares"
import { Profile } from "./profile"



const ProfileRouter = Router()

ProfileRouter
    .get("/get-my-profile", Profile.GetMyProfile)
    .put("/update", validate(updateProfileDto), Profile.UpdateProfile)


export  {ProfileRouter}