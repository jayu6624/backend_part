import { asynchandler } from "../utils/asynchandler.js";
import { User } from "../models/user.model.js";
import { uploadfile } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import APIerror from "../utils/Apierror.js";
const generateAccesandReftokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw APIerror(500, "somthing went wrong");
  }
};

const registerUser = asynchandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);
  if (
    [fullname, email, username, password].some((filed) => filed.trim() === "")
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
  // const coverImagelocalpath = req.files?.coverImage[0]?.path;
  let coverImagepath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImagepath = req.files.coverImage[0].path;
  }

  if (!avatarlocalpath) {
    console.error("Avatar file is missing in the request");
    throw new APIerror(400, "Avatar file is required");
  }

  const avatar = await uploadfile(avatarlocalpath);
  const coverImage = await uploadfile(coverImagepath);

  if (!avatar) {
    throw new APIerror(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
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

const loginUser = asynchandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !email) {
    throw new APIerror(400, "username or password require");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new APIerror(404, "User does not exist");
  }

  const ispasswordvalid = await user.isPasswordCorrect(password);

  if (!ispasswordvalid) {
    throw new APIerror(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccesandReftokens(
    user._id
  );

  const loggedinuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken".refreshToken, option)
    .json(
      new Apiresponse(
        200,
        { user: loggedinuser, accessToken, refreshToken },
        "Usre logged in Successfully"
      )
    );
});

const logoutUser = asynchandler(async (res, req) => {
  await User.findByIdAndUpdate(
    req.user - _id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const option = {
    httpOnly:true,
    secure : true
  }

  return res.status(200).clearCookie("accessToken",accessToken).clearCookie("refreschToken",refreshToken)
});

export { registerUser, loginUser, logoutUser };
