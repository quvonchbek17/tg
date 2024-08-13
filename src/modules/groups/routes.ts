import { Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, blockUserDto } from "@middlewares"
import { Groups } from "./groups"

const GroupRouter = Router()

GroupRouter
    .get("/all", Groups.GetGroups)
    .post("/create", validate(createGroupDto), Groups.CreateGroup)
    .put("/update", validate(updateGroupDto), Groups.UpdateGroup)
    .delete("/delete", validate(deleteGroupDto), Groups.DeleteGroup)

    .post("/leave-user", validate(blockUserDto), Groups.LeaveUser)

export  {GroupRouter}