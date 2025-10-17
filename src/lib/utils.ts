import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?:string | null, email?:string | null){
  return (
    (name ||email || "U").split(" ").map((word)=>word[0].toUpperCase()).join("").slice(0,2)|| "U"

  )
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
export function formatName(name?:string | null){
  if(!name) return "";
  return (
    name?.split(" ").map((word)=>word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
  )
}