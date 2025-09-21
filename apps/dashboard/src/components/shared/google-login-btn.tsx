"use client";
import { useGoogleLogin } from "@react-oauth/google";
import React from "react";
import { Button } from "../ui/button";
import { loginAction } from "@/app/login/actions";

interface GoogleLoginButtonProps {
  children: React.ReactNode;
}

const GoogleLoginButton = ({ children }: GoogleLoginButtonProps) => {
  const handleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      await loginAction(response.access_token!);
    },
  });

  return <Button onClick={() => handleLogin()}>{children}</Button>;
};

export default GoogleLoginButton;
