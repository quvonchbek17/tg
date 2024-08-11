import { Router } from "express";
import {verifyStringSession} from "@middlewares";
import {ProfileRouter, ContactRouter, GroupRouter, ChannelRouter, ChatRouter, MessageRouter, SavedMessagesRouter } from "@modules";
import { AuthRouter } from "src/modules/auth";

const router = Router()

router.use("/profile", verifyStringSession, ProfileRouter)
router.use("/contacts", verifyStringSession, ContactRouter)
router.use("/groups", verifyStringSession, GroupRouter)
router.use("/channels", verifyStringSession, ChannelRouter)
router.use("/chats", verifyStringSession, ChatRouter)
router.use("/messages", verifyStringSession, MessageRouter)
router.use("/auth", AuthRouter)
router.use("/saved-messages", SavedMessagesRouter)

export default router