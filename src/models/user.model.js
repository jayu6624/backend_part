import mongoose from "mongoose";
import { jwt } from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      index: true,
      trim: true,
    },
    email: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      require: true,
      lowercase: true,
      trim: true,
    },
    avtar: {
      type: String,
      require: true,
    },
    coverImage: {
      type: String,
    },
    watchImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "video",
    },
    password: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hash(thispassword, 8);
  next();
});

userSchema.methods.isPasswordCorrect -
  async function (password) {
    return await bcrypt.compare(password, this.password);
  };
userSchema.methods.generateAccessToken = function () {
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname,
  },process.env.ACCESS_TOKEN_SECRETE,{
    expiresIn:process.env.ACCESS_TOKEN_EXPIRY
  }
);
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
       
      },process.env.REFRESH_TOKEN_SECRET,{
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
      })
};

export const usermodel = mongoose.model("usermodel", userSchema);
