import { Router } from "express";
import { validate, savedMessageGetQueryDto, createSavedMessageDto, updateSavedMessageDto, deleteSavedMessageDto, createMultiSavedMessageDto, createStoryDto, getPeerStoriesDto, deleteStoryDto, editStoryDto, exportStoryLinkDto } from "@middlewares"
import { Stories } from "./stories"
import { upload } from "@config";



const StoriesRouter = Router()

StoriesRouter
    .get("/all-me", Stories.GetMeAllStories)
    .get("/peer-stories", validate(getPeerStoriesDto, "query"), Stories.GetOthersStories)

    .post("/create", validate(createStoryDto), upload.single("file"), Stories.CreateStory)
    .post("/export-story-link", validate(exportStoryLinkDto), Stories.ExportStoryLink)

    .put("/edit", validate(editStoryDto), upload.single("file"), Stories.EditStory)

    .delete("/delete", validate(deleteStoryDto), Stories.DeleteStory)


export  {StoriesRouter}