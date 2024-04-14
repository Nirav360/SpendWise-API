import { User } from "../models/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jsonwebtoken from "jsonwebtoken";

const { verify } = jsonwebtoken;

const generateAccessAndRefereshTokens = async (userId, next) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    return { accessToken, refreshToken };
  } catch (error) {
    return next(
      new ErrorHandler(
        500,
        "Something went wrong while generating referesh and access token"
      )
    );
  }
};

const registerUser = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  if ([email, username, password].some((field) => field?.trim() === "")) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    return next(
      new ErrorHandler(409, "User with email or username already exists")
    );
  }

  const user = await User.create({
    email,
    password,
    username,
  });

  const createdUser = await User.findById(user._id);

  if (!createdUser) {
    return next(
      new ErrorHandler(500, "Something went wrong while registering the user")
    );
  }

  return res
    .status(201)
    .json({ success: true, message: "User registered Successfully" });
});

const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler(404, "User does not exist"));
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return next(new ErrorHandler(401, "Invalid user credentials"));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id,
    next
  );

  // Create secure cookie with refresh token
  res.cookie("jwt", refreshToken, {
    httpOnly: false, //accessible only by web server
    // secure: true, //https
    // sameSite: "None", //cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000, //cookie expiry: set to match rT
  });

  return res.status(200).json({
    status: true,
    message: "User logged In Successfully",
    accessToken,
  });
});

const refresh = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return next(new ErrorHandler(401, "Unauthorized request"));

  const refreshToken = cookies.jwt;

  verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      const foundUser = await User.findById(decoded._id);
      if (!foundUser) {
        return next(new ErrorHandler(401, "Invalid Access Token"));
      }
      const accessToken = await foundUser.generateAccessToken();
      res.json({ accessToken });
    }
  );
});

const logoutUser = asyncHandler(async (req, res, next) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  return res
    .clearCookie("jwt", { httpOnly: false })
    .json({ status: true, message: "Cookie cleared" });
});

export { registerUser, loginUser, logoutUser, refresh };
