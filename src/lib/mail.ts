import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Domainin henüz yoksa 'onboarding@resend.dev' kullanmak zorundasın.
// Kendi domainini bağlayınca burayı 'noreply@planora.com' gibi güncelleyeceğiz.
const domain = process.env.NEXT_PUBLIC_APP_URL;

export const sendVerificationEmail = async (email: string, token: string) => {
  // Onay linki (Kullanıcı buna tıklayarak da onaylayabilir)
  const confirmLink = `${domain}/new-verification?token=${token}`;

  try {
    const data = await resend.emails.send({
      from: "Planora <onboarding@resend.dev>",
      to: email,
      subject: "Planora Hesabını Doğrula",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hoş geldin!</h2>
          <p>Planora hesabını güvene almak için aşağıdaki doğrulama kodunu kullan:</p>
          
          <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${token}</span>
          </div>
          
          <p style="margin-top: 30px; font-size: 12px; color: #888;">Bu kodu sen talep etmediysen, bu maili görmezden gelebilirsin.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Mail gönderme hatası:", error);
    return { success: false, error };
  }
};
