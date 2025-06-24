import axios from "axios";

/**
 * @desc    Fetch user location and pincode using lat/lon
 * @route   GET /api/location?lat=xx&lon=yy
 * @access  Public
 * @param   {import('express').Request} req Express request object
 * @param   {import('express').Response} res Express response object
 */
export const getUserLocationController = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing latitude or longitude." });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat,
          lon,
        },
        headers: {
          "User-Agent": "makeMoney24/1.0 (contact@makemoney24.com)",
        },
      }
    );

    const address = response.data?.address || {};
    const pincode = address.postcode || "Unavailable";


    return res.status(200).json({
      message: "Location fetched successfully!",
      location: {
        city: address.city || address.town || address.village || "Unknown",
        state: address.state || "Unknown",
        country: address.country || "Unknown",
        pincode,
        raw: address,
      },
    });
  } catch (error) {
    console.error("❌ Location fetch error:", error.message);
    return res.status(500).json({ error: "Failed to fetch location." });
  }
};
