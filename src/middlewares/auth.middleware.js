import { asynchandler } from "../utils/asynchandler.js";
import APIerror from "../utils/Apierror.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyjwt =  asynchandler(async (req,res,next)=>{
   try {
    const token =  req.cookie?.accessToken || req.header("Authorization")?.replace("Bearer","")
    if(!token)
     {
         throw new APIerror(401,"unauthorization")
     }
    const decodedToken= jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?.i_id).select("-password -refreshToken")
 
    if(!user){
     throw new APIerror(401,"invalid access token")
    }
    req.user = user;
    next()
   } catch (error) {
    throw new APIerror(400,"invalid error")
   }
})


