/** @format */

import { error } from "console"
import { Request, Response, NextFunction } from "express"
import JsonWebToken from "jsonwebtoken"
import { json } from "stream/consumers"

export const Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<any> => {
  const AuthHeader = req.headers.authorization
  if (AuthHeader === undefined || AuthHeader === null) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const token = AuthHeader
  if (token === undefined || token === null) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const decoded = JsonWebToken.verify(
      token,
      process.env.JWT_SECRET_KEY!,
      (error, user) => {
        if (error) {
          return res.status(401).json({ message: "Unauthorized .." })
        }
        req.user = user as AuthUser
        // console.log(req.user)
      }
    )
  } catch (error) {
          return res.status(401).json({ message: "Unauthorized" })

  }

  console.log("Middleware")
  next()
}
