import { Router } from "express";
import { validate, updateGroupDto, createGroupDto, deleteGroupDto, sendMessageToChatDto, updateMessageToChatDto, getChatMessagesDto, deleteMessageInChatDto, getUserChatInfoDto, updateNotificationSettingsUserDto, deleteChatHistoryDto } from "@middlewares"
import { Chats } from "./chats"
import { upload } from "@config";

const ChatRouter = Router()

ChatRouter
    .get("/all", Chats.GetChats)
    .get("/chat-messages", validate(getChatMessagesDto, "query"), Chats.GetChatMessages)
    .get("/info", validate(getUserChatInfoDto, "query"), Chats.GetInfo)

    .post("/send-message", validate(sendMessageToChatDto), upload.single("file"), Chats.SendMessageToChat)


    .patch("/edit-message", validate(updateMessageToChatDto), upload.single("file"), Chats.EditMessage)
    .patch("/notification-settings", validate(updateNotificationSettingsUserDto), Chats.UpdateNotificationSettingsChatUser)

    .delete("/delete", validate(deleteMessageInChatDto), Chats.DeleteMessage)
    .delete("/delete-history", validate(deleteChatHistoryDto), Chats.DeleteChatHistory)

export  {ChatRouter}