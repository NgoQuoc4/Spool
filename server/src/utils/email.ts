import nodemailer from "nodemailer";
import "dotenv/config";

const tranporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});
export const sendVerifyEmail = async ({
  toAddress,
  subject,
  body,
}: {
  toAddress: string;
  subject: string;
  body: string;
}) => {
  const res = await tranporter.sendMail({
    from: `"Spool App"<${process.env.MAIL_USER}>`,
    to: toAddress,
    subject: subject,
    html: body,
  });
};
export const sendVerifyRegisterEmail = async (email: string, token: string) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px;">
      <h2 style="color: #1da1f2; text-align: center;">Xác thực tài khoản Spool</h2>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #1da1f2; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: bold; display: inline-block;">
          Xác thực Email
        </a>
      </div>
      <p style="color: #657786; font-size: 13px;">Hoặc copy đường link này vào trình duyệt: <br/><a href="${verifyLink}">${verifyLink}</a></p>
      <p style="color: #657786; font-size: 13px;">Link có hiệu lực trong vòng 24 giờ.</p>
    </div>
  `;
  return sendVerifyEmail({
    toAddress: email,
    subject: "Xác thực tài khoản của bạn",
    body: htmlContent,
  });
};

export const sendForgotPasswordEmail = async (
  email: string,
  forgot_password_token: string,
) => {
  const verifyLink = `${process.env.CLIENT_URL}/verify-forgot-password?forgot_password_token=${forgot_password_token}`;
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #e1e8ed; border-radius: 12px;">
      <h2 style="color: #1da1f2; text-align: center;">Xác thực tài khoản Spool</h2>
      <p>Xin chào,</p>
      <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng bấm vào nút bên dưới để xác thực địa chỉ email của bạn:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verifyLink}" style="background-color: #1da1f2; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 24px; font-weight: bold; display: inline-block;">
          Xác thực Email
        </a>
      </div>
      <p style="color: #657786; font-size: 13px;">Hoặc copy đường link này vào trình duyệt: <br/><a href="${verifyLink}">${verifyLink}</a></p>
      <p style="color: #657786; font-size: 13px;">Link có hiệu lực trong vòng 24 giờ.</p>
    </div>
  `;
  return sendVerifyEmail({
    toAddress: email,
    subject: "Yêu cầu đặt lại mật khẩu Spool",
    body: htmlContent,
  });
};
