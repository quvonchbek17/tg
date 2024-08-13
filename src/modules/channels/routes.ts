import { Router } from "express";
import { validate, createChannelDto, updateChannelDto, deleteChannelDto, blockChannelUserDto, addUserChannelDto, getBlockedChannelUsersDto, getChannelUsersDto, checkUsernameDto, getChannelMessagesDto, updateChannelPhotoDto } from "@middlewares"
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
    .get("/blocked-users", validate(getBlockedChannelUsersDto, "query"), Channels.GetBlockedUsers)
    .post("/add-user", validate(addUserChannelDto), Channels.AddUserToChannel)
    .post("/check-username", validate(checkUsernameDto), Channels.CheckUsername)
    .put("/update/photo", validate(updateChannelPhotoDto), upload.single("file"),Channels.UpdateChannelPhoto)
    .post("/block-user", validate(blockChannelUserDto), Channels.BlockUser)
    .put("/update/username", validate(checkUsernameDto), Channels.UpdateUsername)


export  {ChannelRouter}