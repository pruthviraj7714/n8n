"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Zap,
  Menu,
  Settings,
  LogOut,
  User,
  Plus,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";


export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-gray-800/95 backdrop-blur supports-[backdrop-filter]:bg-gray-800/60">
      <div className="flex px-4 h-20 max-w-screen-2xl items-center">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <MobileNav />
          </SheetContent>
        </Sheet>

        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">n8n</span>
          </Link>
        </div>


        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={async () => {
                await signOut({ callbackUrl: "/" });
              }}
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Log out</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>{data?.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{data?.user.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {data?.user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 focus:bg-red-500/10 cursor-pointer"
                onClick={async () => {
                  await signOut({ callbackUrl: "/" });
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <div className="flex flex-col space-y-3">
      <Link href="/dashboard" className="flex items-center space-x-2">
        <Zap className="h-6 w-6 text-primary" />
        <span className="font-bold">n8n</span>
      </Link>

      <Button asChild className="w-full justify-start">
        <Link
          href="/dashboard/workflows/new"
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Workflow</span>
        </Link>
      </Button>

    </div>
  );
}
