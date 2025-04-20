// server.js
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// CMS Marketplace API key
const CMS_API_KEY = 'WVXgQwss2zQpmYITlQ4tzP9LQKtmzNA5';

// Your email address
const ADMIN_EMAIL = 'admin@flcins.com';

// Email account to send FROM (example: Gmail)
const EMAIL_USER = 'your-email@gmail.com'; // replace with your email address
const EMAIL_PASS = 'your-app-password'; // replace with your App Password, not your real Gmail password

app.use(cors());
app.use(express.json());

// Setup Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// API endpoint to receive form data
app.post('/get-plans', async (req, res) => {
  const { zip, dob, gender, tobacco, firstName, lastName, email, phone } = req.body;

  try {
    // 1. Send an email to admin@flcins.com
    await transporter.sendMail({
      from: `"Quote Request" <${EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: 'New Quote Request',
      html: `
        <h2>New Insurance Quote Request</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Zip Code:</strong> ${zip}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Tobacco Usage:</strong> ${tobacco}</p>
      `
    });

    // 2. Pull sample plans from CMS API
    const cmsResponse = await fetch('https://api.healthcare.gov/v1/plans/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CMS_API_KEY}`
      },
      body: JSON.stringify({
        zip_code: zip,
        dob: dob,
        gender: gender,
        tobacco_use: tobacco
      })
    });

    if (!cmsResponse.ok) {
      throw new Error('Error fetching plans from CMS API.');
    }

    const cmsData = await cmsResponse.json();

    // Simplify the plans
    const plans = cmsData.plans.map(plan => ({
      name: plan.plan_name,
      premium: plan.monthly_premium,
      carrier: plan.issuer_name,
      metalLevel: plan.metal_level
    }));

    res.json(plans);

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
