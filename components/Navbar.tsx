"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import type { LucideIcon } from "lucide-react";
import { Star, BookOpen, Menu, X } from "lucide-react";

const navItems: { label: string; icon?: LucideIcon }[] = [
  { label: "Panduan", icon: BookOpen },
  { label: "Top Dosen" },
  { label: "Komunitas" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-background/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-current text-blue-500 sm:h-6 sm:w-6" />
          <span className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
            RD
          </span>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {navItems.map(({ label, icon: Icon }) => (
            <Button key={label} variant="ghost" size="sm">
              {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
              {label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" className="hidden sm:inline-flex">
            Login
          </Button>
          <Drawer direction="bottom">
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open menu"
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="gap-0 px-6 py-6">
              <div className="flex h-full flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-current text-blue-500" />
                    <span className="text-base font-semibold text-gray-900 dark:text-white">
                      Navigasi
                    </span>
                  </div>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="icon" aria-label="Close menu">
                      <X className="h-5 w-5" />
                    </Button>
                  </DrawerClose>
                </div>

                <div className="flex flex-col gap-2">
                  {navItems.map(({ label, icon: Icon }) => (
                    <DrawerClose asChild key={label}>
                      <Button
                        variant="ghost"
                        size="lg"
                        className="justify-start rounded-lg text-base"
                      >
                        {Icon ? <Icon className="mr-3 h-5 w-5" /> : null}
                        {label}
                      </Button>
                    </DrawerClose>
                  ))}
                </div>

                <div className="mt-auto pt-2">
                  <DrawerClose asChild>
                    <Button size="lg" className="w-full">
                      Login
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
      </div>
    </nav>
  );
}
