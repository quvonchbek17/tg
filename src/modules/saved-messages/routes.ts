import { Router } from "express";
import { validate, savedMessageGetQueryDto, createSavedMessageDto, updateSavedMessageDto, deleteSavedMessageDto, createMultiSavedMessageDto } from "@middlewares"
import { SavedMessages } from "./saved-messages"
import { upload } from "@config";



const SavedMessagesRouter = Router()

SavedMessagesRouter
    .get("/all", validate(savedMessageGetQueryDto, "query"), SavedMessages.GetSavedMessages)
    .post("/create", validate(createSavedMessageDto), upload.single("file"), SavedMessages.CreateSavedMessage)
    .post("/create/multi", validate(createMultiSavedMessageDto), upload.array("files"), SavedMessages.CreateMultiSavedMessage)
    .put("/edit", validate(updateSavedMessageDto), upload.single("file"), SavedMessages.UpdateSavedMessage)
    .delete("/delete", validate(deleteSavedMessageDto), SavedMessages.DeleteSavedMessage)


export  {SavedMessagesRouter}