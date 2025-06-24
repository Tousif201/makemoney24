// helpers/locationHelpers.js
import axios from 'axios';

/**
 * Fetches a list of pincodes within the same district as the given pincode.
 * @param {string} pincode - The primary pincode to find neighbors for.
 * @returns {Promise<string[]>} - A promise that resolves to an array of pincodes.
 */
export const getNearbyPincodes = async (pincode) => {
  try {
    // Step 1: Get the district of the given pincode
    const initialResponse = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    
    // Check if the API returned a valid response and found the pincode
    if (!initialResponse.data || initialResponse.data[0].Status !== 'Success') {
      console.warn(`Could not find district for pincode: ${pincode}.`);
      return [pincode]; // Fallback to only the original pincode
    }

    const district = initialResponse.data[0].PostOffice[0].District;

    // Step 2: Get all pincodes for that district
    const districtResponse = await axios.get(`https://api.postalpincode.in/postoffice/${district}`);

    if (!districtResponse.data || districtResponse.data[0].Status !== 'Success') {
      console.warn(`Could not find pincodes for district: ${district}.`);
      return [pincode]; // Fallback
    }

    // Use a Set to store unique pincodes, as multiple post offices can share one
    const pincodeSet = new Set();
    districtResponse.data[0].PostOffice.forEach(office => {
      pincodeSet.add(office.Pincode);
    });

    // Also include the original pincode in the set
    pincodeSet.add(pincode);

    // console.log(`Found ${pincodeSet.size} unique pincodes for district '${district}'.`);
    return Array.from(pincodeSet);

  } catch (error) {
    console.error("Error fetching nearby pincodes:", error.message);
    // In case of any API error, gracefully fall back to using only the original pincode
    return [pincode];
  }
};