"use client";

import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFavorite } from "@/hooks/useFavorite";

interface FavoriteButtonProps {
  projectId: string;
  isFavorited?: boolean;
}

export const FavoriteButton = ({
  projectId,
  isFavorited: initialStats,
}: FavoriteButtonProps) => {
  // Bütün mantık artık tek satırda!
  const { isFavorited, toggleFavorite } = useFavorite(projectId, initialStats);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleFavorite}
      className="group hover:bg-transparent"
    >
      <Star
        className={cn(
          "h-5 w-5 transition-all",
          isFavorited
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground group-hover:text-yellow-400"
        )}
      />
    </Button>
  );
};
