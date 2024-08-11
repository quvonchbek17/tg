import { Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto } from "@middlewares"
import { Groups } from "./groups"

const GroupRouter = Router()

GroupRouter
    .get("/all", Groups.GetGroups)
    .post("/create", validate(createGroupDto), Groups.CreateGroup)
    .put("/update", validate(updateGroupDto), Groups.UpdateGroup)
    .delete("/delete", validate(deleteGroupDto), Groups.DeleteGroup)


export  {GroupRouter}