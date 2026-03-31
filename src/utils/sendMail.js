/* export const sendMail = async ({ to, subject, templateData }) => {
  console.log("=== EMAIL MOCK ===");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Reset link:", templateData.link);

  return true;
}; */


import nodemailer from "nodemailer";
import fs from "node:fs/promises";
import path from "node:path";
import handlebars from "handlebars";

const mail = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendMail = async ({ to, subject, templatePath, templateData }) => {
  const templateFullPath = path.resolve(templatePath);
  const templateSource = await fs.readFile(templateFullPath, "utf-8");
  const template = handlebars.compile(templateSource);
  const html = template(templateData);

  return await mail.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
};
