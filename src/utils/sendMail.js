export const sendMail = async ({ to, subject, templateData }) => {
  console.log("📧 EMAIL MOCK");
  console.log("To:", to);
  console.log("Subject:", subject);
  console.log("Link:", templateData.link);

  const token = templateData.link.split("token=")[1];
  console.log("Token:", token);
};
