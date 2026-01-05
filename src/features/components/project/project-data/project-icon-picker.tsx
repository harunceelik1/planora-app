"use client";

import { useState, useRef } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Upload, Smile, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";
import { PRESET_COLORS, PRESET_ICONS } from "@/constants/project";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
// 👇 1. IMPORT ET
import { useTranslations } from "next-intl";

interface ProjectIconPickerProps {
  image: string | null;
  onChange: (data: { image?: string; icon?: string; color?: string }) => void;
  name: string;
  currentIcon?: string | null;
  currentColor?: string | null;
}

export function ProjectIconPicker({
  image,
  onChange,
  name,
  currentIcon,
  currentColor,
}: ProjectIconPickerProps) {
  // 👇 2. HOOK'U BAŞLAT
  const t = useTranslations("ProjectIconPicker");

  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeIcon = currentIcon || "Layout";
  const activeColor = currentColor || "#2563EB";

  const { startUpload, isUploading } = useUploadThing("projectImage", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.url) {
        onChange({ image: res[0].url, icon: "", color: "" });
        toast.success("Resim yüklendi!");
        setIsOpen(false);
      }
    },
    onUploadError: (error: Error) => {
      toast.error(`Hata: ${error.message}`);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await startUpload(Array.from(e.target.files));
    }
  };

  const RenderIcon = ({
    iconName,
    className,
  }: {
    iconName: string;
    className?: string;
  }) => {
    // @ts-ignore
    const IconComponent = Icons[iconName] || Icons.Layout;
    return <IconComponent className={className} />;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="relative group cursor-pointer w-fit">
          {image ? (
            <Avatar className="h-24 w-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-slate-300 transition-colors">
              <AvatarImage src={image} className="object-cover rounded-xl" />
              <AvatarFallback className="rounded-xl">
                <Spinner className="size-8" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              className="h-24 w-24 rounded-xl flex items-center justify-center border-2 border-transparent shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: activeColor }}
            >
              <RenderIcon
                iconName={activeIcon}
                className="h-10 w-10 text-white"
              />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-medium opacity-0 group-hover:opacity-100 rounded-xl transition-opacity">
            {t("overlay.change")} {/* Çeviri: Değiştir */}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="start" side="right">
        <Tabs defaultValue="icon" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-none border-b h-12">
            <TabsTrigger
              value="icon"
              className="cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-all 
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm 
              text-muted-foreground hover:text-foreground"
            >
              <Smile className="w-4 h-4 mr-2 inline-block" /> {t("tabs.icon")}{" "}
              {/* Çeviri: İkon & Renk */}
            </TabsTrigger>

            <TabsTrigger
              value="upload"
              className="cursor-pointer flex-1 rounded-md py-2 text-sm font-medium transition-all 
              data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm 
              text-muted-foreground hover:text-foreground"
            >
              <Upload className="w-4 h-4 mr-2 inline-block" />{" "}
              {t("tabs.upload")} {/* Çeviri: Yükle */}
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: İKON VE RENK */}
          <TabsContent value="icon" className="p-4 space-y-5">
            {/* Renkler */}
            <div>
              <span className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                {t("sections.background")} {/* Çeviri: Arka Plan */}
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() =>
                      onChange({ color, image: "", icon: activeIcon })
                    }
                    className={cn(
                      "cursor-pointer w-6 h-6 rounded-full transition-transform hover:scale-110 border border-black/5 ring-offset-1",
                      activeColor === color && "ring-2 ring-blue-500 scale-110"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* İkonlar */}
            <div>
              <span className="text-xs text-muted-foreground font-semibold mb-2 block uppercase tracking-wide">
                {t("sections.icon")} {/* Çeviri: Simge */}
              </span>
              <div className="grid grid-cols-6 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {PRESET_ICONS.map((icon) => (
                  <button
                    key={icon}
                    onClick={() =>
                      onChange({ icon, image: "", color: activeColor })
                    }
                    className={cn(
                      "cursor-pointer p-2 rounded-md hover:bg-slate-100 flex items-center justify-center transition-colors border border-transparent",
                      activeIcon === icon &&
                        "bg-slate-100 border-slate-300 text-blue-600"
                    )}
                  >
                    <RenderIcon
                      iconName={icon}
                      className="h-5 w-5 text-current"
                    />
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: RESİM YÜKLEME */}
          <TabsContent value="upload" className="p-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              {isUploading ? (
                <Spinner className="size-8" />
              ) : (
                <ImageIcon className="h-8 w-8 text-slate-400" />
              )}
              <span className="text-sm text-muted-foreground text-center">
                {isUploading ? t("upload.loading") : t("upload.placeholder")}{" "}
                {/* Çeviri */}
              </span>
            </div>

            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />

            {image && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-red-500 hover:text-red-600"
                onClick={() => {
                  onChange({ image: "", icon: activeIcon, color: activeColor });
                  setIsOpen(false);
                }}
              >
                {t("upload.remove")} {/* Çeviri: Resmi Kaldır */}
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
