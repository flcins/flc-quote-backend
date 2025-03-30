const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 4000;

const API_KEY = process.env.CMS_API_KEY;

app.use(cors());
app.use(express.json());

app.post('/api/get-quote', async (req, res) => {
  const { zip, income, householdSize, applicants } = req.body;

  console.log("✅ Received request:", req.body);

  if (!zip || !income || !householdSize || !applicants?.length) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const dob = applicants[0].dob;
  const query = new URLSearchParams({
    zip,
    household_income: income,
    dob,
    household_size: householdSize
  }).toString();

  const options = {
    hostname: 'marketplace.api.healthcare.gov',
    path: `/api/v1/plans/search?${query}`,
    method: 'GET',
    headers: {
      'api_key': API_KEY
    }
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', (chunk) => {
      data += chunk;
    });

    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log("📦 Raw CMS Response:", JSON.stringify(result, null, 2)); // <-- NEW LINE

        const plans = result?.plans?.map(plan => ({
          name: plan.plan_name,
          premium: plan.monthly_premium,
          deductible: plan.deductible,
          carrier: plan.issuer_name
        })) || [];

        console.log(`✅ CMS Plans returned: ${plans.length}`);
        res.json(plans);
      } catch (err) {
        console.error('❌ JSON Parsing Error:', err.message);
        res.status(500).json({ message: 'Error parsing CMS response', data });
      }
    });
  });

  request.on('error', (error) => {
    console.error('❌ HTTPS Request Error:', error.message);
    res.status(500).json({ message: 'CMS API request failed', error: error.message });
  });

  request.end();
});

app.listen(PORT, () => {
  console.log("🔐 Loaded CMS API Key:", API_KEY ? "✅ Exists" : "❌ Missing");
  console.log(`✅ Server is running on port ${PORT}`);
});
