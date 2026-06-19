# 🚀 Planora - Proje ve Görev Yönetim Sistemi

Planora; ekiplerin projelerini, görevlerini (issues) ve üye yetkilendirmelerini dinamik bir şekilde yönetebilmesi için geliştirilmiş modern, kurumsal düzeyde bir **Proje Yönetim (Project Management)** platformudur.

---

## 🛠️ Kullanılan Teknolojiler

Proje, modern web standartlarına ve yüksek performans mimarisine uygun olarak şu teknolojilerle inşa edilmiştir:

* **Framework:** Next.js 14+ (App Router) & React.js
* **Veri Yönetimi & Önbellekleme:** SWR (Stale-While-Revalidate)
* **Veritabanı & ORM:** Prisma ORM (PostgreSQL / Supabase )
* **Kimlik Doğrulama (Auth):** NextAuth.js
* **Tasarım & UI:** Tailwind CSS, Shadcn UI, Radix UI Primitives
* **Çoklu Dil Desteği (i18n):** Next-intl
* **İkon Kütüphanesi:** Lucide React
* **Bildirimler:** React-Toastify

---

## ✨ Öne Çıkan Özellikler

* **Rol Bazlı Yetkilendirme (RBAC):** Proje içinde `OWNER` (Lider), `ADMIN` (Yönetici) ve `MEMBER` (Üye) rolleri mevcuttur. Sadece liderler üye silebilir veya rol değiştirebilir.
* **Güvenli Sahiplik Devri:** Proje sahipliği (Ownership) kilit mekanizmalarıyla başka bir üyeye güvenli bir şekilde devredilebilir.
* **Akıllı Bildirim Sistemi:** Okunmamış bildirim sayacı, tekil veya toplu (`markAll`) bildirim okuma API optimizasyonları mevcuttur.
* **Otomatik Hatırlatıcılar (Cron Jobs):** Teslim tarihi yaklaşan görevleri arka planda otomatik tarayıp kullanıcıları uyaran zamanlanmış görev mimarisi kurgulanmıştır.
* **Gelişmiş Görev Formu:** Görev durumları (Todo, In Progress, Done), öncelik dereceleri (Low, Medium, High, Urgent), Story Point atamaları ve UTC senkronizasyonlu takvim seçimi içerir.
* **Karanlık Mod (Dark Mode):** Tüm arayüz bileşenlerinde tam dark mode uyumluluğu sağlanmıştır.

---

## 💻 Yerel Kurulum ve Çalıştırma

Projeyi kendi bilgisayarınızda çalıştırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

### 1. Projeyi Klonlayın
```bash
git clone [https://github.com/harunceelik1/planora-app.git](https://github.com/harunceelik1/planora-app.git)
cd planora-app
