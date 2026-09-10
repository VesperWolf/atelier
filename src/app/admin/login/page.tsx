"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await signIn(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/admin");
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDEBE9]">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-[0.2em] text-[#121212] font-sans">
            ATELIER ARTIZAN
          </h1>
          <p className="mt-2 text-sm text-[#8A8578] tracking-wide">
            Admin Panel
          </p>
        </div>

        <form action={handleSubmit} className="space-y-5 rounded-xl border border-[#E8E3DD] bg-white p-8 shadow-sm">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@atelierartizan.com"
              className="border-[#E8E3DD]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              className="border-[#E8E3DD]"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#121212] hover:bg-[#121212]/90"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
