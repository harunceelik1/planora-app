export type User = {
  id: string;
  email: string | null;
  hasPassword?: boolean; // Şifresi var mı yok mu?
  name: string | null;
  image: string | null;
  jobTitle: string | null;
  location: string | null;
  phone: string | null;
  timezone: string | null;
  birthdate: string | null;
  emailVerified: string | null;
};
