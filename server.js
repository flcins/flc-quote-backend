// server.js

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables from Render
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const ADMIN_EMAIL = 'admin@flcins.com';

app.use(cors());
app.use(express.json());

// Configure Nodemailer with SMTP2GO
const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 2525,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

// POST endpoint to receive quote request and send mock plans
app.post('/get-plans', async (req, res) => {
  const { zip, dob, gender, tobacco, firstName, lastName, email, phone } = req.body;

  try {
    // Send notification email to admin
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

    // Instead of calling CMS, just return full mock plans
    const plans = [
      {
        planName: 'Silver 5 Advanced',
        carrier: 'Aetna CVS Health',
        estimatedMonthlyPremium: 75.45,
        annualDeductibleIndividual: 0.00,
        annualDeductibleFamily: 0.00,
        outOfPocketLimitIndividual: 1695,
        outOfPocketLimitFamily: 3300,
        genericPrescriptions: 0.00,
        planType: 'HMO',
        coverageLevel: 'Silver'
      },
      {
        planName: 'Silver 203',
        carrier: 'Ambetter from Sunshine Health',
        estimatedMonthlyPremium: 7.01,
        annualDeductibleIndividual: 0.00,
        annualDeductibleFamily: 0.00,
        outOfPocketLimitIndividual: 1250,
        outOfPocketLimitFamily: 2500,
        genericPrescriptions: 1.00,
        planType: 'EPO',
        coverageLevel: 'Silver'
      },
      {
        planName: 'UHC Silver-X Copay Focus',
        carrier: 'UnitedHealthcare',
        estimatedMonthlyPremium: 55.30,
        annualDeductibleIndividual: 0.00,
        annualDeductibleFamily: 0.00,
        outOfPocketLimitIndividual: 1600,
        outOfPocketLimitFamily: 3200,
        genericPrescriptions: 0.00,
        planType: 'HMO',
        coverageLevel: 'Silver'
      }
    ];

    res.json(plans);

  } catch (error) {
    console.error('Server Error:', error.message);
    res.status(500).json({ message: 'Server error occurred. Please try again later.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
