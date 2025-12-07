// lib/uploadthing.ts
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

// 👇 useUploadThing'i buradan dışarı aktarıyoruz
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
