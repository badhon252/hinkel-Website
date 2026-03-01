"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export function AuthModal({ isOpen, onClose, redirectUrl }: AuthModalProps) {
  const router = useRouter();

  const handleLogin = () => {
    const loginPath = redirectUrl
      ? `/login?callbackUrl=${encodeURIComponent(redirectUrl)}`
      : "/login";
    router.push(loginPath);
    onClose();
  };

  const handleSignUp = () => {
    const signupPath = redirectUrl
      ? `/register?callbackUrl=${encodeURIComponent(redirectUrl)}`
      : "/register";
    router.push(signupPath);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold text-center">
            Ready to start creating?
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground text-base">
            Join Hinkelcrick to transform your photos into magical coloring
            pages and save your creations.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-6">
          <Button
            onClick={handleLogin}
            className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" />
            Log In to Continue
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={handleSignUp}
            className="w-full h-12 text-base font-semibold border-primary/20  hover:bg-primary/5 transition-all flex items-center justify-center gap-2 bg-black"
          >
            <UserPlus className="w-5 h-5 text-primary" />
            Create a Free Account
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Maybe later
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
