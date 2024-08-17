import { query, Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, blockUserDto, getGroupInfoDto, getGroupMembersDto, getGroupMessagesDto, pinMessageGroupDto, getGroupInviteLink, checkGroupInviteLinkDto, deleteGroupHistoryDto, deleteGroupMessagesDto, deleteMemberMessagesDto, updateGroupAboutDto, updateGroupPhotoDto, updateGroupAdminDto, deleteExportedChatInviteDto, sendMessageToGroupDto, getScheduledMessagesDto, getScheduledHistoryDto, deleteScheduledMessagesDto, editChatDefaultBannedRights, editExportedChatInviteDto, getAdminWithInvitesDto, getArchiveStickersDto, getChatInviteImportersDto } from "@middlewares"
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
    .get("/members", validate(getGroupMembersDto, "query"), Groups.GetGroupMembers)
    .get("/scheduled-messages", validate(getScheduledMessagesDto, "query"), Groups.GetScheduledMessages)
    .get("/scheduled-history", validate(getScheduledHistoryDto, "query"), Groups.GetScheduledHistory)
    .get("/admin-invites", validate(getAdminWithInvitesDto, "query"), Groups.GetAdminsWithInvites)
    .get("/all-drafts", Groups.GetAllDrafts)
    .get("/all-stickers", Groups.GetAllStickers)
    .get("/available-reactions", Groups.GetAvailableReactions)
    .get("/invite-importers", validate(getChatInviteImportersDto, "query"), Groups.GetChatInviteImporters)
    .get("/archive-stickers", validate(getArchiveStickersDto, "query"), Groups.GetArchivedStickers)


    .post("/get-invite-link", validate(getGroupInviteLink), Groups.GetInviteLink)
    .post("/block-user", validate(blockUserDto), Groups.BlockUser)
    .post("/send-message", validate(sendMessageToGroupDto), upload.single("file"), Groups.SendMessageToGroup)
    .post("/unblock-user", validate(blockUserDto), Groups.UnBlockUser)
    .post("/pin-message", validate(pinMessageGroupDto), Groups.PinMessage)
    .post("/unpin-message", validate(pinMessageGroupDto), Groups.UnPinMessage)
    .post("/check-invite", validate(checkGroupInviteLinkDto), Groups.CheckInviteLink)


    .put("/update-about", validate(updateGroupAboutDto), Groups.UpdateChatAbout)
    .put("/update-photo", validate(updateGroupPhotoDto), upload.single("file"),Groups.UpdateChatPhoto)
    .put("/update-admin", validate(updateGroupAdminDto),Groups.UpdateChatAdmin)
    .put("/default-banned-rights", validate(editChatDefaultBannedRights),Groups.EditChatDefaultBannedRights)
    .put("/exported-chat-invite", validate(editExportedChatInviteDto),Groups.EditExportedChatInvite)


    .delete("/delete-history", validate(deleteGroupHistoryDto), Groups.DeleteHistory)
    .delete("/delete-history", validate(deleteGroupHistoryDto), Groups.DeleteHistory)
    .delete("/clear-all-drafts",  Groups.ClearAllDrafts)
    .delete("/exported-chat-invite", validate(deleteExportedChatInviteDto),  Groups.DeleteExportedChatInvite)
    .delete("/clear-recent-stickers",  Groups.ClearRecentStickers)
    .delete("/member-messages", validate(deleteMemberMessagesDto), Groups.DeleteMemberMesssages)
    .delete("/scheduled-messages", validate(deleteScheduledMessagesDto), Groups.DeleteScheduledMessages)

export  {GroupRouter}