const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer();

app.use(express.static(path.join(__dirname, 'public'))); // Serving static files from "public" folder
app.use(upload.none());

// OAuth credentials (using environment variables)
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(name, email, appointment, message) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'superreyfernando2@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: 'superreyfernando2@gmail.com',
      to: 'superreyfernando2@gmail.com',
      subject: 'New Appointment Booked',
      text: `Name: ${name}\nEmail: ${email}\nDate/Time: ${appointment}\nMessage: ${message}`,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    throw error;
  }
}

app.post('/book-appointment', async (req, res) => {
  const { name, email, appointment, message } = req.body;

  try {
    await sendMail(name, email, appointment, message);
    res.send('Appointment successfully booked!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error booking appointment.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
