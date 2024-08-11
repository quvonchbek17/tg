import { Router } from "express";
import { validate, updateProfileDto, addContactDto } from "@middlewares"
import { Contacts } from "./contacts"



const ContactRouter = Router()

ContactRouter
    .get("/all", Contacts.GetContacts)
    .post("/create", validate(addContactDto), Contacts.AddContact)


export  {ContactRouter}