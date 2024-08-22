import { Router } from "express";
import { validate, updateProfileDto, addContactDto, blockUserOrContactDto, getBlockContactsDto, searchContactDto, getContactInfoByPhoneDto, getContactInfoByUsernameDto, deleteContacts, editContactDto } from "@middlewares"
import { Contacts } from "./contacts"



const ContactRouter = Router()

ContactRouter
    .get("/all", Contacts.GetContacts)
    .get("/blocks", validate(getBlockContactsDto, "query"), Contacts.GetBlocks)
    .get("/info-by-phone", validate(getContactInfoByPhoneDto, "query"), Contacts.GetContactInfoByPhone)
    .get("/info-by-username", validate(getContactInfoByUsernameDto, "query"), Contacts.GetContactInfoByUsername)

    .post("/create", validate(addContactDto), Contacts.AddContact)
    .post("/search-contact", validate(searchContactDto), Contacts.SearchContact)
    .post("/search-contact", validate(searchContactDto), Contacts.SearchContact)

    .patch("/edit", validate(editContactDto), Contacts.EditContact)

    .delete("/delete", validate(deleteContacts), Contacts.DeleteContacts)
    .delete("/block-user", validate(blockUserOrContactDto), Contacts.BlockUserOrContact)
    .delete("/unblock-user", validate(blockUserOrContactDto), Contacts.UnBlockUserOrContact)


export  {ContactRouter}