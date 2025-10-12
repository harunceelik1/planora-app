"use client";

import { useRouter } from "next/navigation";

interface AuthFooterProps {
  isSignIn: boolean;
}

const AuthFooter = ({ isSignIn }: AuthFooterProps) => {
  const router = useRouter();

  return (
    <div className="flex justify-center text-sm  pt-4 border-t rounded-b-lg w-full">
      {isSignIn ? (
        <>
          Don’t have an account?
          <button
            className="pl-2 hover:text-[#303030] cursor-pointer transition duration-300"
            onClick={() => router.push("/sign-up")}
          >
            Sign up
          </button>
        </>
      ) : (
        <>
          Already have an account?
          <button
            className="pl-2 hover:text-[#303030] cursor-pointer transition duration-300"
            onClick={() => router.push("/sign-in")}
          >
            Sign in
          </button>
        </>
      )}
    </div>
  );
};

export default AuthFooter;
