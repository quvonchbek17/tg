import { Router } from "express";
import {verifyStringSession} from "@middlewares";
import {ProfileRouter, ContactRouter, GroupRouter, ChannelRouter, ChatRouter, MessageRouter, SavedMessagesRouter, AuthRouter, StoriesRouter } from "@modules";

const router = Router()

router.use("/profile", verifyStringSession, ProfileRouter)
router.use("/contacts", verifyStringSession, ContactRouter)
router.use("/groups", verifyStringSession, GroupRouter)
router.use("/channels", verifyStringSession, ChannelRouter)
router.use("/chats", verifyStringSession, ChatRouter)
router.use("/messages", verifyStringSession, MessageRouter)
router.use("/auth", AuthRouter)
router.use("/saved-messages", verifyStringSession, SavedMessagesRouter)
router.use("/stories", verifyStringSession, StoriesRouter)

export default router