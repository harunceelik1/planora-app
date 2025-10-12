"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/navigation";

import { useAuthForm } from "@/hooks/useAuthForm";
import AuthFooter from "./authFooter";

interface AuthCardProps {
  type: "signin" | "signup"; // hangi sayfa olduğunu belirtir
}

const AuthCard = ({ type }: AuthCardProps) => {
  const router = useRouter();
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordError,
    handleSubmit,
    isSignIn,
  } = useAuthForm(type);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="w-full items-center flex flex-col">
      <Card className="w-full h-full md:w-[487px] bg-gray-100 flex flex-col">
        <CardHeader className="flex flex-col items-center justify-center text-center pt-7">
          <CardTitle className="text-xl font-semibold">
            {isSignIn ? "Sign in to Planora" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {isSignIn
              ? "Welcome back! Please sign in to continue"
              : "Welcome! Please fill in the details to get started."}
          </CardDescription>
        </CardHeader>

        <div className="px-7 mb-2">
          <Separator />
        </div>
        <CardContent className="space-y-4 px-7 flex-1">
          <form onSubmit={handleSubmit} className="">
            <div className="grid gap-2">
              {!isSignIn && (
                <>
                  <Label htmlFor="name" className="text-sm">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="hover:border-gray-400 focus:border-white transition-colors duration-300"
                  />
                </>
              )}
              <Label htmlFor="email" className="text-sm">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                required
                // pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="hover:border-gray-400 focus:border-white transition-colors duration-300"
              />
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
              <div className="relative w-full">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="hover:border-gray-400 focus:border-white transition-colors duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}
              <div className="flex justify-center gap-4">
                <Button
                  type="submit"
                  className="mt-4 flex-1 cursor-pointer"
                  variant="outline"
                >
                  {isSignIn ? "Sign In" : "Sign Up"}
                </Button>
                <Button
                  type="button"
                  className="mt-4 flex-1 cursor-pointer"
                  variant="outline"
                  onClick={() => signIn("google", { callbackUrl: "/" })}
                >
                  <FcGoogle size={30} className="mr-2" /> Google
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <AuthFooter isSignIn={isSignIn} />
        </CardFooter>
      </Card>
    </div>
  );
};
export default AuthCard;
