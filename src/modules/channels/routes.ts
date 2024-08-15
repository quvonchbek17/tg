import { Router } from "express";
import { validate, createChannelDto, updateChannelDto, deleteChannelDto, blockChannelUserDto, addUserChannelDto, getBlockedChannelUsersDto, getChannelUsersDto, checkUsernameDto, getChannelMessagesDto, updateChannelPhotoDto, deleteChannelHistoryDto, getChannelInfoDto, setChannelDiscussionGroupDto, exportMessageLinkChannelDto } from "@middlewares"
import { Channels } from "./channels"
import { upload } from "@config";

const ChannelRouter = Router()

ChannelRouter
    .get("/all", Channels.GetChannels)
    .post("/create", validate(createChannelDto), Channels.CreateChannel)
    .patch("/update", validate(updateChannelDto), Channels.UpdateChannel)
    .delete("/delete", validate(deleteChannelDto), Channels.DeleteChannel)

    .get("/users", validate(getChannelUsersDto, "query"), Channels.GetUsers)
    .get("/messages", validate(getChannelMessagesDto, "query"), Channels.GetChannelMessages)
    .get("/info", validate(getChannelInfoDto, "query"), Channels.GetChannelMessages)
    .get("/blocked-users", validate(getBlockedChannelUsersDto, "query"), Channels.GetBlockedUsers)
    .get("/groups-for-discussion", Channels.GetGroupsForDiscussion)
    .get("/message-link", validate(exportMessageLinkChannelDto, "query"), Channels.GetMessageLink)
    .post("/block-user", validate(blockChannelUserDto), Channels.BlockUser)
    .post("/add-user", validate(addUserChannelDto), Channels.AddUserToChannel)
    .post("/check-username", validate(checkUsernameDto), Channels.CheckUsername)
    .post("/set-discussion-group", validate(setChannelDiscussionGroupDto), Channels.SetDiscussionGroup)
    .put("/update/photo", validate(updateChannelPhotoDto), upload.single("file"),Channels.UpdateChannelPhoto)
    .put("/update/username", validate(checkUsernameDto), Channels.UpdateUsername)
    .delete("/delete-history", validate(deleteChannelHistoryDto), Channels.DeleteHistory)


export  {ChannelRouter}