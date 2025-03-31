const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Your CMS Marketplace API key
const CMS_API_KEY = "WVXgQwss2zQpmYITlQ4tzP9LQKtmzNA5";

// Main route to get ACA plans
app.post('/get-plans', async (req, res) => {
  const { zip, dob, gender, tobacco } = req.body;

  try {
    const age = getAge(new Date(dob));
    const year = 2025; // You can dynamically set this if needed

    const apiUrl = `https://api.marketplace.cms.gov/marketplace-insurance-plans/v4/plans?zipCode=${zip}&marketplace=FFM&year=${year}`;

    const response = await axios.get(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'apikey': CMS_API_KEY
      }
    });

    const plans = response.data.plans.map(plan => ({
      name: plan.marketingName,
      premium: plan.individualMonthlyPremium,
      issuer: plan.issuerName,
      metalLevel: plan.metalLevel,
      planType: plan.planType
    }));

    res.status(200).json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error.message);
    res.status(500).json({ error: "Failed to fetch plans" });
  }
});

// Helper to calculate age from DOB
function getAge(dob) {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
