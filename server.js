// server.js (Updated Version)

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const cmsApiKey = process.env.CMS_API_KEY;

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 587,
  auth: {
    user: smtpUser,
    pass: smtpPass
  }
});

app.post('/get-plans', (req, res) => {
  const mockPlans = [
    {
      planName: 'Silver 5 Advanced',
      carrier: 'Aetna CVS Health',
      estimatedMonthlyPremium: 75.45,
      annualDeductibleIndividual: 0,
      annualDeductibleFamily: 0,
      outOfPocketLimitIndividual: 1695,
      outOfPocketLimitFamily: 3300,
      genericPrescriptions: 0.00,
      planType: 'HMO',
      coverageLevel: 'Silver'
    },
    {
      planName: 'Silver 203',
      carrier: 'Ambetter from Sunshine Health',
      estimatedMonthlyPremium: 85.70,
      annualDeductibleIndividual: 4450,
      annualDeductibleFamily: 8900,
      outOfPocketLimitIndividual: 7250,
      outOfPocketLimitFamily: 14500,
      genericPrescriptions: 0.00,
      planType: 'EPO',
      coverageLevel: 'Silver'
    },
    {
      planName: 'Wellpoint Essential Silver 2500',
      carrier: 'Wellpoint',
      estimatedMonthlyPremium: 95.30,
      annualDeductibleIndividual: 2500,
      annualDeductibleFamily: 5000,
      outOfPocketLimitIndividual: 9200,
      outOfPocketLimitFamily: 18400,
      genericPrescriptions: 0.00,
      planType: 'HMO',
      coverageLevel: 'Silver'
    }
  ];
  res.json(mockPlans);
});

app.post('/choose-plan', async (req, res) => {
  const { userInfo, selectedPlan } = req.body;

  const mailOptions = {
    from: 'FLC Insurance Quotes <quotes@flcins.com>',
    to: 'admin@flcins.com',
    subject: 'New Plan Selected',
    html: `
      <h2>New Health Insurance Plan Selected</h2>
      <p><strong>Name:</strong> ${userInfo.firstName} ${userInfo.lastName}</p>
      <p><strong>Email:</strong> ${userInfo.email}</p>
      <p><strong>Phone:</strong> ${userInfo.phone}</p>
      <p><strong>Zip Code:</strong> ${userInfo.zip}</p>
      <p><strong>Date of Birth:</strong> ${userInfo.dob}</p>
      <p><strong>Gender:</strong> ${userInfo.gender}</p>
      <p><strong>Tobacco Usage:</strong> ${userInfo.tobacco}</p>
      ${userInfo.spouse ? `
        <h3>Spouse/Partner:</h3>
        <p><strong>Relation:</strong> ${userInfo.spouse.relation}</p>
        <p><strong>Gender:</strong> ${userInfo.spouse.gender}</p>
        <p><strong>Date of Birth:</strong> ${userInfo.spouse.dob}</p>
        <p><strong>Tobacco Usage:</strong> ${userInfo.spouse.tobacco}</p>
      ` : ''}
      ${userInfo.dependents.length > 0 ? `
        <h3>Dependents:</h3>
        ${userInfo.dependents.map((dep, idx) => `
          <p><strong>Dependent ${idx + 1}:</strong> ${dep.relation}, ${dep.gender}, DOB: ${dep.dob}, Tobacco: ${dep.tobacco}</p>
        `).join('')}
      ` : ''}
      <h3>Selected Plan:</h3>
      <p><strong>Plan Name:</strong> ${selectedPlan.planName}</p>
      <p><strong>Carrier:</strong> ${selectedPlan.carrier}</p>
      <p><strong>Estimated Monthly Premium:</strong> $${selectedPlan.estimatedMonthlyPremium}/mo</p>
      <p><strong>Annual Deductible:</strong> Individual: $${selectedPlan.annualDeductibleIndividual} | Family: $${selectedPlan.annualDeductibleFamily}</p>
      <p><strong>In-Network Out-of-Pocket Limit:</strong> Individual: $${selectedPlan.outOfPocketLimitIndividual} | Family: $${selectedPlan.outOfPocketLimitFamily}</p>
      <p><strong>Generic Prescriptions:</strong> $${selectedPlan.genericPrescriptions}</p>
      <p><strong>Plan Type:</strong> ${selectedPlan.planType}</p>
      <p><strong>Coverage Level:</strong> ${selectedPlan.coverageLevel}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Plan email sent successfully' });
  } catch (error) {
    console.error('Error sending plan email:', error);
    res.status(500).json({ error: 'Failed to send plan email' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
