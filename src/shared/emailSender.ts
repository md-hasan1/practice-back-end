import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async ( email: string, html: string,subject: string,) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: config.emailSender.email,
      pass: config.emailSender.app_pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const info = await transporter.sendMail({
    from: '<belalhossain22000@gmail.com>',
    to: email,
    subject: `${subject}`,
    html,
  });

  // console.log("Message sent: %s", info.messageId);
};

export default emailSender;


// const fetch = require("node-fetch");

// const apiKey = "F8893DEB1D5DCE067434B1168EC23A61E3F7"; // Get this from Elastic Email Dashboard

// async function sendEmail() {
//   const response = await fetch("https://api.elasticemail.com/v2/email/send", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       apiKey: apiKey,
//       from: "mdhasan26096@gmail.com",
//       to: "akonhasan680@gmail.com",
//       subject: "Hello from Elastic Email!",
//       bodyHtml: "<h1>Hello from Elastic Email!</h1>",
//       isTransactional: "true",
//     }),
//   });

//   const data = await response.json();
//   console.log("Response:", data);
// }

// sendEmail();