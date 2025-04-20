// server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// Your SMTP2GO credentials (saved in Render environment variables)
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

// Your CMS Marketplace API Key
const CMS_API_KEY = 'WVXgQwss2zQpmYITlQ4tzP9LQKtmzNA5';

// Your destination email (where you want quote requests sent)
const ADMIN_EMAIL = 'admin@flcins.com';

app.use(cors());
app.use(express.json());

// Setup Nodemailer transporter with SMTP2GO
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// POST endpoint to receive form submission and return plans
app.post('/get-plans', async (req, res) => {
  const { zip, dob, gender, tobacco, firstName, lastName, email, phone } = req.body;

  try {
    // 1. Send an email notification
    await transporter.sendMail({
      from: '"FLC Insurance Quotes" <admin@flcins.com>',
      to: ADMIN_EMAIL,
      subject: 'New Health Insurance Quote Request',
      html: `
        <h2>New Quote Request Received</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Zip Code:</strong> ${zip}</p>
        <p><strong>Date of Birth:</strong> ${dob}</p>
        <p><strong>Gender:</strong> ${gender}</p>
        <p><strong>Tobacco Usage:</strong> ${tobacco}</p>
      `
    });

    // 2. Fetch ACA Plans from CMS Marketplace API
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

    // Format plans to send back to the frontend
    const plans = cmsData.plans.map(plan => ({
      name: plan.plan_name,
      premium: plan.monthly_premium,
      carrier: plan.issuer_name,
      metalLevel: plan.metal_level
    }));

    res.json(plans);

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ message: 'Server error occurred. Please try again later.' });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
