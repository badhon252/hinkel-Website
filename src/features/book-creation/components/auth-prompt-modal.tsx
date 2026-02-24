import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, LogIn } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-border shadow-2xl p-6 sm:p-8 rounded-2xl">
        <DialogHeader className="space-y-3 mb-6">
          <DialogTitle className="text-2xl font-bold text-center text-foreground">
            Authentication Required
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base">
            Please log in or create a free account to continue transforming your
            images into beautiful sketch coloring books.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 w-full">
          <Link href="/register" className="w-full" onClick={onClose}>
            <Button className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white shadow-md transition-all gap-2 rounded-xl">
              <UserPlus className="w-5 h-5" />
              Create a Free Account
            </Button>
          </Link>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground font-medium">
                Or
              </span>
            </div>
          </div>

          <Link href="/login" className="w-full" onClick={onClose}>
            <Button
              variant="outline"
              className="w-full h-12 text-base font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-all gap-2 rounded-xl"
            >
              <LogIn className="w-5 h-5" />
              Log In
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
