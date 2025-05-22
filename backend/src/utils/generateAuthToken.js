import jwt from "jsonwebtoken";
export const generateAuthToken = (res, userId, email, role, params = {}) => {
  const token = jwt.sign(
    { id: userId, email, role, ...params },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};
