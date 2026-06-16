import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    },
});


export const sendUserCredentialsEmail = async (to, name, tempPassword) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Your Account Created",
    html: `
      <h3>Welcome ${name || ""}</h3>
      <p>Your account has been created successfully.</p>
      <p><b>Temporary Password:</b> ${tempPassword}</p>
      <p>Please login and change your password immediately.</p>
    `,
  });
};


export const sendResetOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "Password Reset OTP",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Password Reset OTP</h2>
        <p>Your OTP is:</p>

        <h1 style="letter-spacing: 6px; color: #2563eb;">
          ${otp}
        </h1>

        <p>This OTP is valid for <b>5 minutes</b>.</p>
      </div>
    `,
  });
};

