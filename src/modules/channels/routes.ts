import { Router } from "express";
import { validate, createChannelDto, updateChannelDto, deleteChannelDto } from "@middlewares"
import { Channels } from "./channels"

const ChannelRouter = Router()

ChannelRouter
    .get("/all", Channels.GetChannels)
    .post("/create", validate(createChannelDto), Channels.CreateChannel)
    .patch("/update", validate(updateChannelDto), Channels.UpdateChannel)
    .delete("/delete", validate(deleteChannelDto), Channels.DeleteChannel)


export  {ChannelRouter}