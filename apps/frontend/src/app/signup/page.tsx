"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Zap, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/lib/config";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/v1/user/signup`, formData);
      toast.success("User Account Successfully Created", {
        description: "Now Signin with your credentials",
      });
      router.push("/signin");
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-3/4 w-64 h-64 bg-chart-2/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <header className="border-b border-border/30 bg-card/20 backdrop-blur-lg sticky top-0 z-50 shadow-lg shadow-primary/5">
        <div className="mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
              <Zap className="w-6 h-6 text-primary-foreground animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Zaplane
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Features
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Pricing
            </a>
            <a href="/signin" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Sign In
            </a>
            <a href="/signup">
              <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground shadow-lg shadow-accent/25 hover:shadow-accent/40 transition-all duration-300 hover:scale-105">
                Get Started
              </Button>
            </a>
          </nav>
        </div>
      </header>

      <div className="relative z-10 py-10 flex flex-col items-center justify-center px-4 pb-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Create your account
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Start automating your workflows today and unlock unlimited
              productivity
            </p>
          </div>
          <Card className="bg-gradient-to-br from-card/90 to-card/60 border border-border/40 backdrop-blur-lg shadow-2xl shadow-primary/10 hover:shadow-accent/20 transition-all duration-500 hover:scale-[1.02]">
            <CardHeader className="pb-6">
              <CardTitle className="text-2xl text-card-foreground bg-gradient-to-r from-card-foreground to-muted-foreground bg-clip-text text-transparent">
                Register
              </CardTitle>
              <CardDescription className="text-lg text-muted-foreground leading-relaxed">
                Enter your details to create your Zaplane account and join
                thousands of users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-card-foreground font-medium text-base"
                  >
                    Username
                  </Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="bg-input/80 border-border/60 text-foreground placeholder:text-muted-foreground backdrop-blur-sm h-12 text-base focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-card-foreground font-medium text-base"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-input/80 border-border/60 text-foreground placeholder:text-muted-foreground backdrop-blur-sm h-12 text-base focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-card-foreground font-medium text-base"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="bg-input/80 border-border/60 text-foreground placeholder:text-muted-foreground backdrop-blur-sm h-12 text-base pr-12 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all duration-300"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-muted/50 transition-all duration-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-accent-foreground h-12 text-base font-semibold shadow-2xl shadow-accent/30 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 group"
                >
                  Create Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link
                    href="/signin"
                    className="text-accent hover:text-accent/90 font-medium transition-all duration-300 hover:scale-105 inline-block"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="leading-relaxed">
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                className="text-accent hover:text-accent/90 transition-colors duration-300"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="text-accent hover:text-accent/90 transition-colors duration-300"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}