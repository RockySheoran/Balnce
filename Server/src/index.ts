/** @format */

import express, { Application, Request, Response } from "express"

import "dotenv/config"
import path from "path"
import { fileURLToPath } from "url"
import ejs from "ejs"
import { sendMail } from "./Config/mail.js"
import route from "./Routes/mainRoutes.js"
import cors from "cors"


import "./Service/index.js"
import { emailQueue, emailQueueName } from "./Service/emailJob.js"
import { promises } from "dns"
import asyncHandler from "./Config/asyncHandler.js"
import prisma from "./Config/DataBase.js"
import { limiter } from "./Config/rateLimit.js"
import { dirname } from 'path';

//! Port

const PORT = process.env.PORT || 7000
const app: Application = express()

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import helmet from "helmet";
// Middleware to parse JSON and URL-encoded data
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// Apply rate limiting
// app.use(rateLimit())

// Set view engine
app.set("view engine", "ejs")
app.set("views", path.resolve(__dirname, "./views"))

// Route to render and send email

app.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const html = await ejs.renderFile(__dirname + `/views/email/welcome.ejs`, {
      name: "rocky",
    })
    // console.log(html)
    await sendMail("rockysheoran1@gmail.com", "test", html)

    await emailQueue.add(emailQueueName, {
      to: "rockysheoran1@gmail.com",
      subject: "Test",
      body: html,
    })
    //  const newUser = await prisma.user.create({
    //    data: {
    //      name :"Rocky",
    //      email:"d" ,
    //      password:"fffsddsdgsdgds",
    //    },
    //  })
    //  console.log(newUser)

    return res.json({ message: "ok" })
  })
)

//Queue radis









//! Routes
const corsOption = {
  origin: ["http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}
app.use(cors(corsOption))

app.use(route)
// app limit
app.use(limiter)
app.use(helmet());









// redis
// 
import "./Config/redis/redis.js"
// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`)
})
