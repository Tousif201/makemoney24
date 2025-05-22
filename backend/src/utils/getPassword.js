import bcrypt from "bcryptjs";

export  const getHashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const getComparePassword = async function (password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
};
