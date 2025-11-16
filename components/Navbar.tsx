"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Star, BookOpen, Menu, X, SchoolIcon } from "lucide-react";
import { ShimmerButton } from "./ui/shimmer-button";
import { RainbowButton } from "./ui/rainbow-button";

const navItems: { label: string; icon?: LucideIcon; href: string }[] = [
  { label: "Campuses", icon: SchoolIcon, href: "#panduan" },
  { label: "Top Dosen", href: "/dosen" },
  { label: "Daftar Rating", href: "/rated" },
  { label: "Universitas", href: "/universities" },
  { label: "Komunitas", href: "#komunitas" },
];

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-background/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16">
        <Link
          href="/"
          aria-label="Kembali ke beranda"
          className="flex items-center justify-center logo-link"
        >
          <svg
            viewBox="0 0 167 68"
            className="size-10 md:size-12 text-gray-900 dark:text-white logo-svg"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path d="M2.02472e-07 3.75014e-06H48.9009C53.3465 3.75014e-06 57.3686 0.564518 60.9674 1.69355C64.5662 2.75201 67.6357 4.30442 70.176 6.35077C72.7163 8.39714 74.6568 10.9022 75.9975 13.8659C77.3383 16.759 78.0086 20.0402 78.0086 23.7095C78.0086 29.2135 76.5621 33.9061 73.6689 37.7871C70.7758 41.5975 66.7889 44.1731 61.7083 45.5139L77.9028 67.7415H55.5692L40.8566 47.4191H30.3778C26.5674 47.4191 23.5331 48.0542 21.2751 49.3243C19.0876 50.5239 17.9938 52.4644 17.9938 55.1459V67.7415H2.02472e-07V3.75014e-06ZM19.0523 33.2357C20.6047 32.1067 22.2277 31.2952 23.9212 30.8012C25.6853 30.2367 27.9081 29.9545 30.5895 29.9545H50.5945C53.8404 29.9545 56.0279 29.39 57.1569 28.2609C58.3565 27.1319 58.9563 25.6148 58.9563 23.7095C58.9563 21.6632 58.286 20.1108 56.9452 19.0523C55.6751 17.9939 53.4523 17.4646 50.2769 17.4646H17.9938V33.2357H19.0523ZM83.3125 3.75014e-06H129.567C135.142 3.75014e-06 140.152 0.811491 144.597 2.43447C149.114 3.98688 152.959 6.24493 156.135 9.20862C159.31 12.1723 161.745 15.7358 163.438 19.8991C165.202 24.0624 166.084 28.7196 166.084 33.8708C166.084 44.8082 162.944 53.2053 156.664 59.0622C150.384 64.8484 141.351 67.7415 129.567 67.7415H83.3125V3.75014e-06ZM129.25 50.2769C135.459 50.2769 139.975 48.9715 142.798 46.3606C145.621 43.7498 147.032 39.5865 147.032 33.8708C147.032 28.1551 145.621 23.9918 142.798 21.3809C139.975 18.7701 135.354 17.4646 128.932 17.4646H101.306V50.2769H129.25Z" />
          </svg>
        </Link>

        <div className="hidden items-center gap-4 lg:flex">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Button key={label} variant="ghost" size="sm" asChild>
              <Link href={href}>
                {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                {label}
              </Link>
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <RainbowButton
            onClick={() => {
              // nextjs open /login
              window.location.href = "/login";
            }}
            className="hidden sm:inline-flex h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5"
          >
            Loginn
          </RainbowButton>
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
                  {navItems.map(({ label, icon: Icon, href }) => (
                    <DrawerClose asChild key={label}>
                      <Button
                        asChild
                        variant="ghost"
                        size="lg"
                        className="justify-start rounded-lg text-base"
                      >
                        <Link href={href}>
                          {Icon ? <Icon className="mr-3 h-5 w-5" /> : null}
                          {label}
                        </Link>
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
