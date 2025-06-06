import { User } from "../models/User.model.js";

/**
 * Generates a referral code starting with "MM" followed by a series of numbers (or alphanumeric if desired).
 *
 * @param {number} length - Total length of the referral code including "MM". Defaults to 8.
 * @returns {string} - The generated referral code.
 */
const generateReferralCode = (length = 8) => {
  const prefix = "MM";
  const numericCharacters = "0123456789";
  // const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Use this line if you want mixed alpha + numeric

  let referralCode = prefix;

  for (let i = 0; i < length - prefix.length; i++) {
    referralCode += numericCharacters.charAt(
      Math.floor(Math.random() * numericCharacters.length)
    );
  }

  return referralCode;
};

/**
 * Generates a unique referral code starting with "MM", checking against the database.
 *
 * @param {number} length - Total length of the referral code including "MM". Defaults to 8.
 * @returns {Promise<string>} - A promise that resolves with the unique referral code.
 */
const generateUniqueReferralCode = async (length = 8) => {
  let referralCode;
  let isUnique = false;
  let retryCount = 0;
  const MAX_RETRIES = 10; // Optional safeguard

  while (!isUnique) {
    referralCode = generateReferralCode(length);
    const existingUser = await User.findOne({ referralCode: referralCode });

    if (!existingUser) {
      isUnique = true;
    }

    retryCount++;
    if (retryCount > MAX_RETRIES) {
      throw new Error(
        "Failed to generate a unique referral code after too many attempts."
      );
    }
  }

  return referralCode;
};

export { generateUniqueReferralCode };
