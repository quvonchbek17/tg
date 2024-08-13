import { query, Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, blockUserDto, getGroupInfoDto, getGroupMembersDto, getGroupMessagesDto, pinMessageGroupDto, getInviteLink } from "@middlewares"
import { Groups } from "./groups"

const GroupRouter = Router()

GroupRouter
    .get("/all", Groups.GetGroups)
    .post("/create", validate(createGroupDto), Groups.CreateGroup)
    .put("/update", validate(updateGroupDto), Groups.UpdateGroup)
    .delete("/delete", validate(deleteGroupDto), Groups.DeleteGroup)

    .get("/info", validate(getGroupInfoDto, "query"), Groups.GetGroupInfo)
    .get("/messages", validate(getGroupMessagesDto, "query"), Groups.GetGroupMessages)
    .get("/invite-link", validate(getInviteLink, "query"), Groups.GetInviteLink)
    .get("/members", validate(getGroupMembersDto, "query"), Groups.GetGroupMembers)
    .post("/block-user", validate(blockUserDto), Groups.BlockUser)
    .post("/unblock-user", validate(blockUserDto), Groups.UnBlockUser)
    .post("/pin-message", validate(pinMessageGroupDto), Groups.PinMessage)
    .post("/unpin-message", validate(pinMessageGroupDto), Groups.UnPinMessage)

export  {GroupRouter}