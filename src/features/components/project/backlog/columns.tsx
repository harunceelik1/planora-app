"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Issue } from "@/types/project";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from "lucide-react"; // PlusCircle ikonunu ekle
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";

// Yardımcı: Öncelik renklerini belirle
const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-50 text-red-600 border-red-100";
    case "medium":
      return "bg-yellow-50 text-yellow-600 border-yellow-100";
    case "low":
      return "bg-green-50 text-green-600 border-green-100";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const columns: ColumnDef<Issue>[] = [
  // 1. SELECT (Yuvarlak Checkbox)
  {
    id: "select",
    header: ({ table }) => (
      <div className="pl-4">
        {" "}
        {/* Sol boşluk */}
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="rounded-full border-slate-300 w-5 h-5 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="pl-4">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="rounded-full border-slate-300 w-5 h-5 data-[state=checked]:bg-slate-800 data-[state=checked]:border-slate-800"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // 2. TASK INFO (Başlık + Alt Bilgi)
  {
    accessorKey: "title",
    header: "TASK NAME", // Başlık
    cell: ({ row }) => {
      // Mock veriler (Eğer veritabanında yoksa)
      const id = "SAD-102";
      const tag = "Design"; // veya row.original.type

      return (
        <div className="flex flex-col py-1">
          <span className="font-semibold text-slate-800 text-sm">
            {row.getValue("title")}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-0.5">
            {id} • {tag}
          </span>
        </div>
      );
    },
  },

  // 3. PRIORITY (Renkli Haplar)
  {
    accessorKey: "priority",
    header: "PRIORITY",
    cell: ({ row }) => {
      const priority = (row.getValue("priority") as string) || "Medium";
      return (
        <Badge
          variant="outline"
          className={`border font-medium px-2.5 py-0.5 text-[10px] rounded-full shadow-none ${getPriorityColor(priority)}`}
        >
          {priority}
        </Badge>
      );
    },
  },

  // 4. ASSIGNEE (Kişi)
  {
    accessorKey: "assignee",
    header: "ASSIGNEE",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className="text-xs text-slate-500">Ana S.</span>
      </div>
    ),
  },

  // 5. ACTIONS (Boşluk)
  {
    id: "actions",
    header: "ACTIONS", // Başlığı boş bırakmak genelde daha temiz durur
    cell: ({ row }) => {
      return (
        <div className="flex w-full justify-end pr-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-800 hover:bg-slate-100 data-[state=open]:bg-slate-100 transition-all rounded-md"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            {/* 👇 SORUNU ÇÖZEN KISIM BURASI */}
            <DropdownMenuContent
              align="end"
              className="w-40 bg-white border border-slate-200 shadow-lg rounded-lg p-1 z-50"
            >
              {/* Düzenle Seçeneği */}
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 px-2 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-md transition-colors"
                onClick={() => console.log("Düzenle", row.original)}
              >
                <Pencil className="h-4 w-4" />
                <span>Düzenle</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="bg-slate-100 my-1" />

              {/* Sil Seçeneği */}
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2 px-2 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors focus:bg-red-50 focus:text-red-700"
                onClick={() => console.log("Sil", row.original)}
              >
                <Trash2 className="h-4 w-4" />
                <span>Sil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
