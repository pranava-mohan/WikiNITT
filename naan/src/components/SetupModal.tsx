"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { gql } from "@/gql";
import { GraphQLClient } from "graphql-request";
import { useRouter } from "next/navigation";
import { User, Check, X, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const COMPLETE_SETUP_MUTATION = gql(`
  mutation CompleteSetup($input: CompleteSetupInput!) {
    completeSetup(input: $input)
  }
`);

const CHECK_USERNAME_QUERY = gql(`
  query CheckUsername($username: String!) {
    checkUsername(username: $username)
  }
`);

export function SetupModal() {
  const { data: session, update } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const router = useRouter();

  useEffect(() => {
    if (session?.user && session.user.setupComplete === false) {
      setIsOpen(true);

      if (session.user.displayName)
        setDisplayName(session.user.displayName || session.user.name || "");
    } else {
      setIsOpen(false);
    }
  }, [session]);

  const checkUsername = async (val: string) => {
    if (!val || val.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_API_URL!, {
      headers: {
        Authorization: `Bearer ${session?.backendToken}`,
      },
    });

    try {
      const data = await client.request(CHECK_USERNAME_QUERY, {
        username: val,
      });
      setUsernameAvailable(data.checkUsername);
    } catch (err) {
      console.error("Failed to check username", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(username)) {
      setError(
        "Username can only contain letters, numbers, underscores, periods, and hyphens",
      );
      setLoading(false);
      return;
    }

    const displayNameRegex = /^[a-zA-Z0-9 ]+$/;
    if (!displayNameRegex.test(displayName)) {
      setError("Display name can only contain letters, numbers, and spaces");
      setLoading(false);
      return;
    }

    if (!usernameAvailable) {
      setError("Username is not available");
      setLoading(false);
      return;
    }

    const client = new GraphQLClient(process.env.NEXT_PUBLIC_GRAPHQL_API_URL!, {
      headers: {
        Authorization: `Bearer ${session?.backendToken}`,
      },
    });

    try {
      await client.request(COMPLETE_SETUP_MUTATION, {
        input: {
          username,
          displayName,
        },
      });

      await update({
        ...session,
        user: {
          ...session?.user,
          setupComplete: true,
          username,
          displayName,
        },
      });

      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error("Setup failed", err);

      const message =
        err.response?.errors?.[0]?.message ||
        err.message ||
        "Failed to complete setup";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && session?.user?.setupComplete === false) {
      return;
    }
    setIsOpen(open);
  };

  if (!session || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[480px] [&>button]:hidden border-none bg-white/95 backdrop-blur-xl shadow-2xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-xl" />

        <DialogHeader className="space-y-3 pt-4">
          <div className="mx-auto bg-blue-50 p-3 rounded-full w-fit mb-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
          </div>
          <DialogTitle className="text-2xl font-bold text-center bg-clip-text text-transparent bg-linear-to-r from-blue-600 to-purple-600">
            Welcome to WikiNITT
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Let's customize your profile to get you started.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium ml-1">
                Username
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-blue-500">
                  <User className="w-4 h-4" />
                </div>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUsername(val);
                    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
                    if (val.length >= 3 && usernameRegex.test(val)) {
                      checkUsername(val);
                    } else if (val.length > 0 && !usernameRegex.test(val)) {
                      setUsernameAvailable(false);
                    } else {
                      setUsernameAvailable(null);
                    }
                  }}
                  placeholder="Choose a unique username"
                  required
                  minLength={3}
                  className={`pl-10 h-11 transition-all duration-200 border-2 focus:border-blue-500 focus:ring-0 ${
                    usernameAvailable === false
                      ? "border-red-500 bg-red-50"
                      : usernameAvailable === true
                        ? "border-green-500 bg-green-50"
                        : "border-input hover:border-blue-300"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameAvailable === true && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-500"
                    >
                      <Check className="w-4 h-4" />
                    </motion.div>
                  )}
                  {usernameAvailable === false && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </motion.div>
                  )}
                  {username.length >= 3 && usernameAvailable === null && (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
              <div className="h-5 ml-1">
                {usernameAvailable === false && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-500 font-medium"
                  >
                    That username is already taken
                  </motion.span>
                )}
                {usernameAvailable === true && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-green-500 font-medium"
                  >
                    Username available!
                  </motion.span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium ml-1">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How should we call you?"
                required
                className="h-11 border-2 focus:border-purple-500 focus:ring-0 hover:border-purple-300 transition-all duration-200"
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={loading || usernameAvailable === false}
              className="w-full h-11 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
