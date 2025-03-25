import express,{ Router } from "express";
import authRoute from "./authRoutes.js";
import { emailVerify } from "./emailVerifyRoutes.js";
import { authlimiter } from "../Config/rateLimit.js";
import { accountRoute } from "./AcountRoutes.js";
import TransactionRouter from "./TransactionRoute.js";

const route =express.Router();

route.use("/api/auth",authlimiter,authRoute);
route.use("/",emailVerify);
route.use("/api/account", accountRoute)
route.use("/api/transaction",TransactionRouter)

export default route;