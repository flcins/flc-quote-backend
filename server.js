// server.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,  // Your SMTP2GO username
    pass: process.env.SMTP_PASS,  // Your SMTP2GO password
  },
});

app.post('/send-plan', async (req, res) => {
  try {
    const { customerFirstName, customerLastName, customerEmail, customerPhone, selectedPlan } = req.body;

    // Email to YOU (admin)
    const adminEmailBody = `
      <h2>New Plan Selection Received</h2>
      <p><strong>Name:</strong> ${customerFirstName} ${customerLastName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Phone:</strong> ${customerPhone}</p>
      <p><strong>Selected Plan:</strong> ${selectedPlan.name}</p>
      <p><strong>Carrier:</strong> ${selectedPlan.carrier}</p>
      <p><strong>Estimated Monthly Premium:</strong> $${selectedPlan.premium}/mo</p>
      <p><strong>Annual Deductible:</strong> Individual: $${selectedPlan.deductibleIndividual} | Family: $${selectedPlan.deductibleFamily}</p>
      <p><strong>In-Network Out-of-Pocket Limit:</strong> Individual: $${selectedPlan.outOfPocketIndividual} | Family: $${selectedPlan.outOfPocketFamily}</p>
      <p><strong>Generic Prescriptions:</strong> ${selectedPlan.prescriptions}</p>
      <p><strong>Plan Type:</strong> ${selectedPlan.planType}</p>
      <p><strong>Coverage Level:</strong> ${selectedPlan.coverageLevel}</p>
    `;

    await transporter.sendMail({
      from: 'FLC Insurance Quotes <quotes@flcins.com>',
      to: 'admin@flcins.com',
      subject: 'New Health Insurance Plan Selected',
      html: adminEmailBody,
    });

    // Email to CUSTOMER
    const customerEmailBody = `
      <p>Dear ${customerFirstName},</p>
      <p>Thank you for choosing your health insurance plan with FLC Insurance!<br>
      A representative will reach out to you shortly to complete your enrollment.</p>
      <p>If you have any questions, please call us directly at <strong>(800) 459-5750</strong>.</p>
      <p>Thank you,<br>FLC Insurance Team</p>
    `;

    await transporter.sendMail({
      from: 'FLC Insurance Quotes <quotes@flcins.com>',
      to: customerEmail,
      subject: 'Thank You for Choosing Your Health Insurance Plan',
      html: customerEmailBody,
    });

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending plan email:', error);
    res.status(500).json({ message: 'Error sending emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
