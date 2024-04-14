import ErrorHandler from "../utils/errorHandler.js";
import jsonwebtoken from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

const { verify } = jsonwebtoken;

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return next(new ErrorHandler(401, "Unauthorized request"));
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new ErrorHandler(401, "Unauthorized request"));
    }

    verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Forbidden" });
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    return next(
      new ErrorHandler(401, error?.message || "Invalid access token")
    );
  }
});

export default { verifyJWT };
