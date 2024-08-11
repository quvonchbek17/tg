import express, { Application, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errorHandler } from "@middlewares"
import router from "./routes"
import fileUpload from "express-fileupload"
dotenv.config()

const app: Application = express()

//// cors
app.use(cors({ origin: "*" }))

// Parsers
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// app.use(fileUpload())

app.use("/api/v1", router)

app.use(errorHandler)

const port = process.env.PORT || 8000
app.listen(port, () => {
    console.log(port)
})