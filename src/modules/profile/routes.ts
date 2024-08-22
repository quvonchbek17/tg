import { Router } from "express";
import { validate, updateProfileDto, updateUsernameProfileDto, updateProfilePhotoDto, deleteProfilePhotoDto, terminateSessionDto } from "@middlewares"
import { Profile } from "./profile"
import { upload } from "@config";



const ProfileRouter = Router()

ProfileRouter
    .get("/get-my-profile", Profile.GetMyProfile)
    .get("/get-profile-photos", Profile.GetProfilePhotos)
    .get("/get-privacy-setting", Profile.GetPrivacySettings)
    .get("/get-active-sessions", Profile.GetActiveSessions)
    .put("/update", validate(updateProfileDto), Profile.UpdateProfile)
    .put("/update-username", validate(updateUsernameProfileDto), Profile.UpdateUsername)
    .put("/update-profile-photo", upload.single("file"), validate(updateProfilePhotoDto), Profile.UpdateProfilePhotoOrVideo)
    .delete("/delete-profile-photo", validate(deleteProfilePhotoDto), Profile.DeleteProfilePhoto)
    .delete("/terminate-session", validate(terminateSessionDto), Profile.TerminateSession)


export  {ProfileRouter}