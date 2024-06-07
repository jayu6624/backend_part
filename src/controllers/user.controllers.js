import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadfile } from "../utils/cloudinary.js";
import { Apiresponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { verifyJWT } from "../middlewares/auth.middleware.js";
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

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullname, email, username, password } = req.body;
  //console.log("email: ", email);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadfile(avatarLocalPath);
  const coverImage = await uploadfile(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
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
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new Apiresponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password, email } = req.body;

  if (!(username || email)) {
    throw new ApiError(400, "username or password require");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const ispasswordvalid = await user.isPasswordCorrect(password);

  console.log(ispasswordvalid);

  if (!ispasswordvalid) {
    throw new ApiError(401, "Invalid credentials");
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
    .cookie("refreshToken", refreshToken, option)
    .json(
      new Apiresponse(
        200,
        { user: loggedinuser, accessToken, refreshToken },
        "Usre logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Apiresponse(200, {}, "User logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRef = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRef) {
    throw new ApiError(401, "unauthorize request");
  }
  try {
    const decodedtoken = jwt.verify(
      incomingRef,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedtoken?._id);
    if (!user) {
      throw ApiError(401, "invalid refresh token");
    }
    if (incomingRef !== user?.refreshToken) {
      throw ApiError(401, "refresh token is expired of user");
    }

    const option = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } = await generateAccesandReftokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(new Apiresponse(200, {}, "Access token refreshed "));
  } catch (error) {
    throw ApiError(401, error?.message || "invliad refresh token");
  }
});

const changecurrentpassword = asyncHandler(async (req, res) => {
  const { oldpassword, newPassword, confpassword } = req.body;
  const user = await User.findById(req.user?._id);
  const ispasswordcorrect = await user.isPasswordCorrect(oldpassword);

  if (!ispasswordcorrect) {
    throw ApiError(400, "old password is incorrect");
  }
  if (newPassword !== confpassword) {
    throw ApiError(400, "password not match with new password");
  }
  user.password = newPassword;
  const passsave = await user.save({ validateBeforeSave: false });

  if (!passsave) {
    throw ApiError(400, "password not save in database");
  }

  return res
    .status(200)
    .json(new Apiresponse(200, {}, "password changes successfully"));
});

const getcurrentuser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.res, "current user fetched successfully");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { newemail, newfullname } = req.body;

  if (!(fullname || email)) {
    throw ApiError(400, "all feilds are require");
  }

  const refid = req.user?._id;

  const user = await User.findByIdAndUpdate(
    refid,
    {
      $set: {
        fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res
    .status(200)
    .json(new Apiresponse(200, user, "Account details update successfully"));
});

const updateavatar = asyncHandler(async (req, res) => {
  const avatarlocalpath = req.file?.path;

  if (!avatarlocalpath) {
    throw ApiError(400, "avatar file is missing");
  }
  const avatar = await uploadfile(avatarlocalpath);

  if (!avatar.url) {
    throw ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    res.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password");
  

  return res.status(200).json(Apiresponse(200,user,"avatar image updated successfully"))
});


const updatecoverImage = asyncHandler(async (req, res) => {
    const coverimagelocalpath = req.file?.path;
  
    if (!coverimagelocalpath) {
      throw ApiError(400, "coverimage file is missing");
    }
    const coverimg = await uploadfile(coverimagelocalpath);
  
    if (!coverimg.url) {
      throw ApiError(400, "Error while uploading on coverimg");
    }
  
    const user = await User.findByIdAndUpdate(
      res.user._id,
      {
        $set: {
            coverImage: coverimg.url,
        },
      },
      { new: true }
    ).select("-password");

    return res.status(200).json(new Apiresponse(200,user,"coverimage updated successfully"))
  });

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changecurrentpassword,
  getcurrentuser,
  updateAccountDetails,
  updateavatar,
  updatecoverImage
};
