// server.js

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  host: 'mail.smtp2go.com',
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

function createPDF(customerInfo, selectedPlan) {
  const doc = new PDFDocument();

  doc.fontSize(18).fillColor('#004AAD').text('FLC Insurance - Quote Summary', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).fillColor('black').text(`Customer Name: ${customerInfo.customerFirstName} ${customerInfo.customerLastName}`);
  doc.text(`Email: ${customerInfo.customerEmail}`);
  doc.text(`Phone: ${customerInfo.customerPhone}`);

  doc.moveDown();
  doc.fontSize(14).fillColor('#004AAD').text('Selected Plan Details:', { underline: true });
  doc.moveDown(0.5);

  doc.fontSize(12).fillColor('black')
    .text(`Plan Name: ${selectedPlan.planName}`)
    .text(`Carrier: ${selectedPlan.carrier}`)
    .text(`Estimated Monthly Premium: $${selectedPlan.estimatedMonthlyPremium}`)
    .text(`Annual Deductible: Individual $${selectedPlan.annualDeductibleIndividual}, Family $${selectedPlan.annualDeductibleFamily}`)
    .text(`In-Network Out-of-Pocket Limit: Individual $${selectedPlan.outOfPocketLimitIndividual}, Family $${selectedPlan.outOfPocketLimitFamily}`)
    .text(`Generic Prescriptions: $${selectedPlan.genericPrescriptions}`)
    .text(`Plan Type: ${selectedPlan.planType}`)
    .text(`Coverage Level: ${selectedPlan.coverageLevel}`);

  doc.end();

  return new Promise((resolve, reject) => {
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
    doc.on('error', reject);
  });
}

app.post('/send-plan', async (req, res) => {
  try {
    const { customerFirstName, customerLastName, customerEmail, customerPhone, selectedPlan } = req.body;

    const customerInfo = { customerFirstName, customerLastName, customerEmail, customerPhone };
    const pdfBuffer = await createPDF(customerInfo, selectedPlan);

    // Email to ADMIN (you)
    await transporter.sendMail({
      from: 'FLC Insurance Quotes <quotes@flcins.com>',
      to: 'admin@flcins.com',
      subject: 'New Health Insurance Plan Selected',
      html: `<h2>New Plan Selection Received</h2>
             <p><strong>Name:</strong> ${customerFirstName} ${customerLastName}</p>
             <p><strong>Email:</strong> ${customerEmail}</p>
             <p><strong>Phone:</strong> ${customerPhone}</p>
             <p>PDF Summary Attached.</p>`,
      attachments: [{ filename: 'QuoteSummary.pdf', content: pdfBuffer }]
    });

    // Email to CUSTOMER
    await transporter.sendMail({
      from: 'FLC Insurance Quotes <quotes@flcins.com>',
      to: customerEmail,
      subject: 'Thank You for Choosing Your Health Insurance Plan',
      html: `<p>Dear ${customerFirstName},</p>
             <p>Thank you for choosing your health insurance plan with FLC Insurance!</p>
             <p>A representative will reach out to you shortly to complete your enrollment.</p>
             <p>If you have any questions, please call us directly at <strong>(800) 459-5750</strong>.</p>
             <p>Thank you,<br>FLC Insurance Team</p>`,
      attachments: [{ filename: 'QuoteSummary.pdf', content: pdfBuffer }]
    });

    res.status(200).json({ message: 'Emails with PDF sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ message: 'Error sending emails' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
