import { query, Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, blockUserDto, getGroupInfoDto, getGroupMembersDto, getGroupMessagesDto, pinMessageGroupDto, getGroupInviteLink, checkGroupInviteLinkDto, deleteGroupHistoryDto, deleteGroupMessagesDto, deleteMemberMessagesDto, updateGroupAboutDto, updateGroupPhotoDto, updateGroupAdminDto } from "@middlewares"
import { Groups } from "./groups"
import { upload } from "@config";

const GroupRouter = Router()

GroupRouter
    .get("/all", Groups.GetGroups)
    .post("/create", validate(createGroupDto), Groups.CreateGroup)
    .put("/update-title", validate(updateGroupDto), Groups.UpdateGroup)
    .delete("/delete", validate(deleteGroupDto), Groups.DeleteGroup)

    .get("/info", validate(getGroupInfoDto, "query"), Groups.GetGroupInfo)
    .get("/messages", validate(getGroupMessagesDto, "query"), Groups.GetGroupMessages)
    .get("/invite-link", validate(getGroupInviteLink, "query"), Groups.GetInviteLink)
    .get("/members", validate(getGroupMembersDto, "query"), Groups.GetGroupMembers)
    .post("/block-user", validate(blockUserDto), Groups.BlockUser)
    .post("/unblock-user", validate(blockUserDto), Groups.UnBlockUser)
    .post("/pin-message", validate(pinMessageGroupDto), Groups.PinMessage)
    .post("/unpin-message", validate(pinMessageGroupDto), Groups.UnPinMessage)
    .post("/check-invite", validate(checkGroupInviteLinkDto), Groups.CheckInviteLink)
    .put("/update-about", validate(updateGroupAboutDto), Groups.UpdateChatAbout)
    .put("/update-photo", validate(updateGroupPhotoDto), upload.single("file"),Groups.UpdateChatPhoto)
    .put("/update-admin", validate(updateGroupAdminDto),Groups.UpdateChatAdmin)
    .delete("/delete-history", validate(deleteGroupHistoryDto), Groups.DeleteHistory)
    .delete("/delete-messages", validate(deleteGroupMessagesDto), Groups.DeleteMesssages)
    .delete("/delete-member-messages", validate(deleteMemberMessagesDto), Groups.DeleteMemberMesssages)

export  {GroupRouter}