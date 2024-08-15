import { Router } from "express";
import {
  validate,
  createChannelDto,
  updateChannelDto,
  deleteChannelDto,
  blockChannelUserDto,
  addUserChannelDto,
  getBlockedChannelUsersDto,
  getChannelUsersDto,
  checkUsernameDto,
  getChannelMessagesDto,
  updateChannelPhotoDto,
  deleteChannelHistoryDto,
  getChannelInfoDto,
  setChannelDiscussionGroupDto,
  exportMessageLinkChannelDto,
  joinChannelDto,
  markAsReadChannelMessagesDto,
  leaveChannelDto,
  deleteChannelMessagesDto,
  updateChannelAdminDto,
} from "@middlewares";
import { Channels } from "./channels";
import { upload } from "@config";

const ChannelRouter = Router();

/////// GET ///////////
ChannelRouter.get("/all", Channels.GetChannels)
  .get("/users", validate(getChannelUsersDto, "query"), Channels.GetUsers)
  .get(
    "/messages",
    validate(getChannelMessagesDto, "query"),
    Channels.GetChannelMessages
  )
  .get(
    "/info",
    validate(getChannelInfoDto, "query"),
    Channels.GetChannelMessages
  )
  .get(
    "/blocked-users",
    validate(getBlockedChannelUsersDto, "query"),
    Channels.GetBlockedUsers
  )
  .get("/groups-for-discussion", Channels.GetGroupsForDiscussion)
  .get(
    "/message-link",
    validate(exportMessageLinkChannelDto, "query"),
    Channels.GetMessageLink
  )

  /////////// POST  ////////////////
  .post("/create", validate(createChannelDto), Channels.CreateChannel)
  .post("/block-user", validate(blockChannelUserDto), Channels.BlockUser)
  .post("/add-user", validate(addUserChannelDto), Channels.AddUserToChannel)
  .post("/check-username", validate(checkUsernameDto), Channels.CheckUsername)
  .post("/join", validate(joinChannelDto), Channels.JoinChannel)
  .post(
    "/set-discussion-group",
    validate(setChannelDiscussionGroupDto),
    Channels.SetDiscussionGroup
  )

  ////////// UPDATE  ////////////
  .patch("/update", validate(updateChannelDto), Channels.UpdateChannel)
  .put("/update-admin", validate(updateChannelAdminDto), Channels.UpdateChannelAdmin)
  .put(
    "/update/photo",
    validate(updateChannelPhotoDto),
    upload.single("file"),
    Channels.UpdateChannelPhoto
  )
  .put("/update/username", validate(checkUsernameDto), Channels.UpdateUsername)
  .put("/mark-as-read-messages", validate(markAsReadChannelMessagesDto), Channels.MarkAsReadChannelMessages)

  ////////// DELETE /////////////
  .delete("/delete", validate(leaveChannelDto), Channels.DeleteChannel)
  .delete("/messages", validate(deleteChannelMessagesDto), Channels.DeleteMessages)
  .delete("/leave", validate(deleteChannelDto), Channels.LeaveChannel)
  .delete(
    "/delete-history",
    validate(deleteChannelHistoryDto),
    Channels.DeleteHistory
  );

export { ChannelRouter };
