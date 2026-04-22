import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
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

interface TaskReminderEmailPayload {
  recipientName?: string | null;
  issueTitle: string;
  projectName: string;
  dueLabel: string;
  statusLabel: string;
  projectUrl?: string;
}

export const sendTaskReminderEmail = async (
  email: string,
  payload: TaskReminderEmailPayload,
) => {
  try {
    const data = await resend.emails.send({
      from: "Planora <onboarding@resend.dev>",
      to: email,
      subject: `Yaklaşan görev: ${payload.issueTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #0f172a;">
          <h2 style="margin-bottom: 12px;">Görev hatırlatması</h2>
          <p>Merhaba ${payload.recipientName || "Planora kullanıcısı"},</p>
          <p><strong>${payload.issueTitle}</strong> görevi için bir hatırlatma oluşturuldu.</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 0 0 8px;"><strong>Proje:</strong> ${payload.projectName}</p>
            <p style="margin: 0 0 8px;"><strong>Durum:</strong> ${payload.statusLabel}</p>
            <p style="margin: 0;"><strong>Teslim:</strong> ${payload.dueLabel}</p>
          </div>
          ${
            payload.projectUrl
              ? `<p><a href="${payload.projectUrl}" style="display: inline-block; background: #0f172a; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 999px;">Görevi görüntüle</a></p>`
              : ""
          }
          <p style="margin-top: 24px; font-size: 12px; color: #64748b;">Bu bildirim teslim tarihi yaklaşan görevler için otomatik olarak gönderildi.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Task reminder mail error:", error);
    return { success: false, error };
  }
};
