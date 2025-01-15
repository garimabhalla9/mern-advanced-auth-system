import {MailtrapClient} from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

// const ENDPOINT=process.env.MAILTRAP_ENDPOINT;

export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.com",
  name: "Garima Bhalla",
};
// const recipients = [
//   {
//     email: "garimabhalla2003@gmail.com",
//   }
// ];

// client
//   .send({
//     from: sender,
//     to: recipients,
//     subject: "You are awesome!",
//     html: "Congrats for sending test email with Mailtrap!",
//     category: "Integration Test",
//   })
//   .then(console.log, console.error);