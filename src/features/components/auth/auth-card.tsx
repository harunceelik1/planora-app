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
    <div className="w-full items-center flex flex-col min-h-screen bg-gray-100 py-10">
      {/* Kartı beyaz yapıyoruz ve gölge ekliyoruz. */}
      <Card className="w-full md:w-[487px] bg-white shadow-xl rounded-xl flex flex-col">
        <CardHeader className="flex flex-col items-center justify-center text-center pt-8 pb-4 space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isSignIn ? "Sign in to Planora" : "Create your account"}
          </CardTitle>
          <CardDescription className="text-base text-gray-600">
            {isSignIn
              ? "Welcome back! Please sign in to continue"
              : "Welcome! Please fill in the details to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-7 flex-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => signIn("google")}
            className="w-full h-10   transition-colors duration-300 border-gray-300 "
          >
            <FcGoogle size={24} className="mr-3" /> Sign{" "}
            {isSignIn ? "In" : "Up"} with Google
          </Button>

          {/* 2. VEYA AYIRICISI */}
          <div className="relative flex justify-center text-xs uppercase">
            <Separator />
            <span className="absolute px-2 text-xs font-medium text-gray-500 bg-white -top-2">
              YA DA
            </span>
          </div>

          {/* 3. MANUEL FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              {!isSignIn && (
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10  border-gray-300 transition-all duration-300"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10  border-gray-300 transition-all duration-300"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password" className="text-sm font-medium">
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
                    className="h-10  border-gray-300 transition-all duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              {passwordError && (
                <p className="text-red-500 text-xs mt-1">{passwordError}</p>
              )}

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="default"
                  className="w-full h-10 font-semibold text-base transition-colors duration-300  text-white"
                >
                  {isSignIn ? "Sign In" : "Sign Up"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="pt-4 pb-8 justify-center border-t border-gray-100 mt-2">
          <AuthFooter isSignIn={isSignIn} />
        </CardFooter>
      </Card>
    </div>
  );
};
export default AuthCard;
