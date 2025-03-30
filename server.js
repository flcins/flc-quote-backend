const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

const API_KEY = process.env.CMS_API_KEY;
console.log("🔐 Loaded CMS API Key:", API_KEY ? "✅ Exists" : "❌ Missing");
app.use(cors());
app.use(express.json());

app.post('/api/get-quote', async (req, res) => {
  const { zip, income, householdSize, applicants } = req.body;

  console.log("✅ Received request:", req.body);

  if (!zip || !income || !householdSize || !applicants?.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // Use primary applicant’s DOB
  const dob = applicants[0].dob;

  try {
    const response = await axios.get('https://marketplace.api.healthcare.gov/api/v1/plans/search', {
      headers: {
        'Authorization': `API-Key ${API_KEY}`
      },
      params: {
        zip,
        household_income: income,
        dob,
        household_size: householdSize
      }
    });

    const plans = response.data?.plans?.map(plan => ({
      name: plan.plan_name,
      premium: plan.monthly_premium,
      deductible: plan.deductible,
      carrier: plan.issuer_name
    })) || [];

    console.log("✅ CMS Plans returned:", plans.length);

    res.json(plans);
  } catch (error) {
    console.error("❌ CMS API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "CMS API failed", error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
