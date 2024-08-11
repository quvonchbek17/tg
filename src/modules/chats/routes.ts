import { Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto } from "@middlewares"
import { Chats } from "./chats"

const ChatRouter = Router()

ChatRouter
    .get("/all", Chats.GetChats)

export  {ChatRouter}