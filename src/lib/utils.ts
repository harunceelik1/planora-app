import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string | null, email?: string | null) {
  const source = name || email || "U";

  return (
    source
      .trim() // 1. Baştaki ve sondaki gereksiz boşlukları sil
      .split(" ")
      .filter((word) => word.length > 0) // 2. Boş stringleri (fazla boşlukları) temizle
      .map((word) => word[0].toUpperCase())
      .join("")
      .slice(0, 2) || "U"
  );
}
// const initials = (session?.user?.name || session?.user?.email || "U")
//   .split(" ")
//   .map((s) => s[0])
//   .join("")
//   .slice(0, 2)
//   .toUpperCase();
// Split fonksiyonu stringi parçalara ayırır ve bunu dizi olarak döndürür örneğin: "John Doe" -> ["John", "Doe"]
// Map fonksiyonu ise bu dizinin her bir elemanına uygulanır. Örneğin yukarıdaki örnekte her ismin ilk harfini alır.
// Join fonksiyonu ise bu harfleri tekrar birleştirir. Örneğin: ["J", "D"] -> "JD"
// Slice fonksiyonu ise stringin belirli bir kısmını alır. Örneğin: "JD" -> "JD" (ilk 2 karakter)
// Charat fonksiyonu ise stringin belirli bir indeksindeki karakteri alır. Örneğin: "John" -> 'J' (0. indeks)
export function formatName(name?: string | null) {
  if (!name) return "";
  return name
    ?.split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
export function formatTimezone(timezone: string) {
  if (!timezone) return "";

  try {
    // 1. O zaman dilimindeki şu anki saati al
    const now = new Date();

    // Saat formatlayıcı (Örn: 14:35)
    const timeFormatter = new Intl.DateTimeFormat("tr-TR", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    // Offset formatlayıcı (Örn: GMT+3)
    const offsetFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "shortOffset",
    });

    const time = timeFormatter.format(now);

    // "GMT+3" kısmını çekmek için biraz string parse işlemi
    const parts = offsetFormatter.formatToParts(now);
    const offset = parts.find((p) => p.type === "timeZoneName")?.value || "";

    // "Europe/Istanbul" stringinden sadece "Istanbul" kısmını al
    // Alt çizgi varsa boşlukla değiştir (New_York -> New York)
    const city = timezone.split("/")[1]?.replace(/_/g, " ") || timezone;

    return {
      time, // "14:35"
      city, // "Istanbul"
      offset, // "GMT+3"
      full: `${time} • ${city} (${offset})`, // "14:35 • Istanbul (GMT+3)"
    };
  } catch (error) {
    // Eğer geçersiz bir timezone gelirse fallback olarak kendisini dön
    return { full: timezone, time: "", city: timezone, offset: "" };
  }
}
