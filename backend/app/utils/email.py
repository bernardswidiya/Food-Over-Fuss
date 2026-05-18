import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_EMAIL = os.getenv("SMTP_EMAIL", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def send_reset_password_email(to_email: str, token: str) -> None:
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"

    html = f"""
    <html>
      <body style="font-family: sans-serif; background: #f9f9f9; padding: 32px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff;
                    border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1a1a2e; margin-bottom: 8px;">Reset Kata Sandi</h2>
          <p style="color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
            Kami menerima permintaan reset kata sandi untuk akun Food&nbsp;Over&nbsp;Fuss kamu.
            Klik tombol di bawah untuk membuat kata sandi baru.
            Link ini berlaku selama <strong>15 menit</strong>.
          </p>
          <a href="{reset_link}"
             style="display: inline-block; background: #4ade80; color: #1a1a2e;
                    font-weight: 700; padding: 14px 28px; border-radius: 9999px;
                    text-decoration: none; font-size: 15px;">
            Reset Kata Sandi
          </a>
          <p style="color: #9ca3af; font-size: 13px; margin-top: 24px; line-height: 1.5;">
            Jika kamu tidak meminta reset kata sandi, abaikan email ini.
            Akun kamu tetap aman.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px;">
            © Food Over Fuss &nbsp;|&nbsp; Jangan balas email ini.
          </p>
        </div>
      </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Reset Kata Sandi – Food Over Fuss"
    msg["From"] = SMTP_EMAIL
    msg["To"] = to_email
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.sendmail(SMTP_EMAIL, to_email, msg.as_string())
