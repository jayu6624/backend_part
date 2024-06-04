import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { uploadfile } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import APIerror from "../utils/Apierror.js"
const registerUser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  if (
    [fullname, email, username, password].some((filed) => filed?.trim() === "")
  ) {
    throw new APIerror(400, "all fields are required");
  }
  const existinguser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existinguser) {
    throw new APIerror(409, "user with email or username already exists");
  }

  const avatarlocalpath = req.files?.avatar[0]?.path;
const coverImagelocalpath = req.files?.coverImage[0]?.path;

if (!avatarlocalpath) {
  console.error("Avatar file is missing in the request");
  throw new APIerror(400, "Avatar file is required");
}

  const avatar = await uploadfile(avatarlocalpath);
  const coverImage = await uploadfile(coverImagelocalpath);

  if (!avatar) {
    throw new APIerror(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url||"",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new APIerror(500, "somthing wents wrong");
  }

  return res
    .status(201)
    .json(new Apiresponse(200, createdUser, "User registerd successfully"));
});

export { registerUser };

