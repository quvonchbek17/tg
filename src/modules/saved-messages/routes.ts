import { Router } from "express";
import { validate, savedMessageGetQueryDto, createSavedMessageDto, updateSavedMessageDto, deleteSavedMessageDto } from "@middlewares"
import { SavedMessages } from "./saved-messages"



const SavedMessagesRouter = Router()

SavedMessagesRouter
    .get("/all", validate(savedMessageGetQueryDto, "query"), SavedMessages.GetSavedMessages)
    .post("/create", validate(createSavedMessageDto), SavedMessages.CreateSavedMessage)
    .put("/edit", validate(updateSavedMessageDto), SavedMessages.UpdateSavedMessage)
    .delete("/delete", validate(deleteSavedMessageDto), SavedMessages.DeleteSavedMessage)


export  {SavedMessagesRouter}