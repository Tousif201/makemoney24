const User = require("../models/user.model"); // Import your User model (if needed for uniqueness check)

/**
 * Generates a unique and user-friendly referral code.
 *
 * @param {number} length - The desired length of the referral code.  Defaults to 8.
 * @returns {string} - The generated referral code.
 */
const generateReferralCode = (length = 8) => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let referralCode = "";

  for (let i = 0; i < length; i++) {
    referralCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return referralCode;
};

/**
 * * Generates a unique and user-friendly referral code, checking against the database.
 * @param {number} length - The desired length of the referral code. Defaults to 8.
 * @returns {Promise<string>} - A promise that resolves with the unique referral code.
 */
const generateUniqueReferralCode = async (length = 8) => {
  let referralCode;
  let isUnique = false;

  while (!isUnique) {
    referralCode = generateReferralCode(length); // Use the basic generator
    const existingUser = await User.findOne({ referralCode: referralCode }); // Check for duplicates
    if (!existingUser) {
      isUnique = true; // Exit the loop if the code is unique
    }
    //  Optionally add a maximum number of retries to prevent infinite loops
    //  if (retryCount > MAX_RETRIES) {
    //    throw new Error("Failed to generate a unique referral code after too many attempts.");
    //  }
  }
  return referralCode;
};

export { generateUniqueReferralCode };
