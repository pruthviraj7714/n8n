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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Zap, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      username: formData.username,
      password: formData.password,
      redirect : false
    });

    if (res?.ok) {
      toast.success("User Successfully Logged In");
      router.push('/dashboard');
    } else {
      toast.error(res?.error);
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
            <a href="/#features" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Features
            </a>
            <a href="/#pricing" className="text-muted-foreground hover:text-accent transition-all duration-300 hover:scale-105 font-medium">
              Pricing
            </a>
            <a href="/signin" className="text-accent font-medium">
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

      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 my-10 relative z-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-accent/20 text-primary border border-primary/30 px-4 py-2 animate-pulse shadow-lg shadow-primary/20">
              <Shield className="w-4 h-4 mr-2" />
              Secure Access
            </Badge>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sign in to your automation dashboard and continue your productivity journey
            </p>
          </div>

        <Card className="bg-gradient-to-br from-card/90 to-card/60 border border-border/40 backdrop-blur-lg shadow-2xl shadow-primary/10 hover:shadow-accent/20 transition-all duration-500 hover:scale-[1.02]">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl text-card-foreground bg-gradient-to-r from-card-foreground to-muted-foreground bg-clip-text text-transparent">
              Sign In
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground leading-relaxed">
              Enter your credentials to access your account and unlock your workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-card-foreground font-medium text-base">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-card-foreground font-medium text-base">
                    Password
                  </Label>
                  <Link
                    href="#"
                    className="text-sm text-accent hover:text-accent/90 transition-all duration-300 hover:scale-105"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                Sign In
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-base text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-accent hover:text-accent/90 font-medium transition-all duration-300 hover:scale-105 inline-block"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p className="leading-relaxed">
              Need help?{" "}
              <Link href="#" className="text-accent hover:text-accent/90 transition-colors duration-300">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}