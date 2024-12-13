import jwt from "jsonwebtoken";
import { JWT_PASS } from "../config";
import { Response } from "express";
import mongoose from "mongoose";

export const generateToken = (userId: mongoose.Types.ObjectId, res: Response) => {
  const token = jwt.sign({ userId }, JWT_PASS, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};