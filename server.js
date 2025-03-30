const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 4000;

const API_KEY = process.env.CMS_API_KEY;

app.use(cors());
app.use(express.json());

app.post('/api/get-quote', async (req, res) => {
  const user = req.body;

  console.log("✅ Incoming Form Data:", user);

  try {
    if (!user.zip || !user.dob || !user.income || !user.totalPeople) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const response = await axios.get('https://marketplace.api.healthcare.gov/api/v1/plans/search', {
      headers: {
        'Authorization': `API-Key ${API_KEY}`
      },
      params: {
        zip: user.zip,
        household_income: user.income,
        dob: user.dob,
        household_size: user.totalPeople
      }
    });

    console.log("✅ CMS API Response:", response.data);

    const plans = response.data?.plans?.map(plan => ({
      name: plan.plan_name,
      premium: plan.monthly_premium,
      deductible: plan.deductible,
      carrier: plan.issuer_name
    })) || [];

    res.json(plans);
  } catch (error) {
    console.error("❌ Error from CMS API:", error.response?.data || error.message);
    res.status(500).json({ message: "CMS API failed", details: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
