// "use client";

// import * as React from "react";
// import { cn } from "@/lib/utils";
// import { Input } from "@/components/ui/input";
// // 👇 Sadece input modülü (Bayraksız, saf input)
// import PhoneInput from "react-phone-number-input/input";

// // Shadcn Input bileşenini, kütüphanenin anlayacağı dile çeviriyoruz.
// // forwardRef kullanımı imleç (cursor) pozisyonu ve odaklanma için KRİTİKTİR.
// const CustomInput = React.forwardRef<HTMLInputElement, any>(
//   ({ className, ...props }, ref) => {
//     return (
//       <Input
//         className={cn(
//           // Shadcn varsayılan stilleri korunur
//           "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
//           className
//         )}
//         {...props}
//         ref={ref}
//       />
//     );
//   }
// );
// CustomInput.displayName = "CustomInput";

// interface ShadcnPhoneInputProps {
//   value: string;
//   onChange: (value: string | undefined) => void;
//   className?: string;
//   placeholder?: string;
//   disabled?: boolean;
// }

// export function ShadcnPhoneInput({
//   value,
//   onChange,
//   className,
//   placeholder,
//   disabled,
// }: ShadcnPhoneInputProps) {
//   return (
//     <PhoneInput
//       country="TR"
//       international={false}
//       value={value}
//       onChange={onChange}
//       placeholder={placeholder}
//       disabled={disabled}
//       // Shadcn Input'u kullan
//       component={CustomInput}
//       // Stilleri ve wrapper'ı düzelt
//       className={cn("flex w-full", className)}
//       // Karakter sınırını koru
//       limitMaxLength={true}
//     />
//   );
// }
