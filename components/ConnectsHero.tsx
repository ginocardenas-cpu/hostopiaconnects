"use client";

import Link from "next/link";
import { ArrowUpRight, Menu, Search, ShoppingBasket, Sparkles, Download, Eye } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Browse", href: "#products" },
  { name: "How it works", href: "/how-it-works" },
];

const highlightBoxes = [
  {
    title: "What's New",
    href: "#highlights",
    icon: Sparkles,
    description: "Newest assets across Connects.",
  },
  {
    title: "Most Downloaded",
    href: "#highlights",
    icon: Download,
    description: "Assets downloaded most frequently.",
  },
  {
    title: "Most Viewed",
    href: "#highlights",
    icon: Eye,
    description: "Most viewed assets in the last period.",
  },
];

export function ConnectsHero() {
  return (
    <div className="w-full relative container px-2 mx-auto max-w-7xl min-h-0">
      <div className="mt-6 bg-accent/50 rounded-2xl relative">
        <header className="flex items-center">
          <div className="w-full md:w-2/3 lg:w-1/2 bg-background/95 backdrop-blur-sm p-4 rounded-br-2xl flex items-center gap-2">
            <Link
              href="/"
              className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
              style={{ fontFamily: "Montserrat, sans-serif" }}
            >
              HostopiaConnects
            </Link>

            <nav className="hidden lg:flex items-center justify-between w-full">
              {navigation.map((item) => (
                <Button
                  key={item.name}
                  variant="link"
                  className="cursor-pointer relative group hover:text-primary transition-colors font-heading"
                  asChild
                >
                  <Link href={item.href}>{item.name}</Link>
                </Button>
              ))}
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer relative group hover:text-primary transition-colors"
                asChild
              >
                <Link href="/#highlights" aria-label="Search">
                  <Search className="w-5 h-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer relative group hover:text-primary transition-colors"
                asChild
              >
                <Link href="/cart" aria-label="My Resources">
                  <ShoppingBasket className="w-5 h-5" />
                </Link>
              </Button>
            </nav>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden ml-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:text-primary transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-[300px] sm:w-[400px] p-0 bg-background/95 backdrop-blur-md border-r border-border/50"
              >
                <SheetHeader className="p-6 text-left border-b border-border/50">
                  <SheetTitle className="flex items-center justify-between">
                    <Link
                      href="/"
                      className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent"
                      style={{ fontFamily: "Montserrat, sans-serif" }}
                    >
                      HostopiaConnects
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-6 space-y-1">
                  {navigation.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="justify-start px-2 h-12 text-base font-medium hover:bg-accent/50 hover:text-primary transition-colors font-heading"
                      asChild
                    >
                      <Link href={item.href}>{item.name}</Link>
                    </Button>
                  ))}
                </nav>
                <Separator className="mx-6" />
                <div className="p-6 flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-12 hover:bg-accent/50 transition-colors"
                    asChild
                  >
                    <Link href="/#highlights">
                      <Search className="w-4 h-4" />
                      Search
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-2 h-12 hover:bg-accent/50 transition-colors relative"
                    asChild
                  >
                    <Link href="/cart">
                      <ShoppingBasket className="w-4 h-4" />
                      My Resources
                    </Link>
                  </Button>
                </div>
                <Separator className="mx-6" />
                <div className="p-6">
                  <Button
                    className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 shadow-lg hover:shadow-xl font-heading"
                    asChild
                  >
                    <Link href="/#products" className="inline-flex items-center">
                      Start Browsing
                      <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex w-1/2 justify-end items-center pr-4 gap-4 ml-auto">
            <Button
              variant="secondary"
              className="cursor-pointer bg-primary-foreground p-0 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group font-heading"
              asChild
            >
              <Link href="/#products" className="inline-flex items-center">
                <span className="pl-4 py-2 text-sm font-medium">Start Browsing</span>
                <div className="rounded-full flex items-center justify-center m-auto bg-background w-10 h-10 ml-2 group-hover:scale-110 transition-transform duration-300">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </Link>
            </Button>
          </div>
        </header>

        <motion.section
          className="w-full px-4 py-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight"
              style={{ fontFamily: "Montserrat, sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <span className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                Everything you need
              </span>
              <br />
              <span className="text-foreground">
                to succeed with Hostopia products.
              </span>
            </motion.h1>
            <motion.p
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "Raleway, sans-serif" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            >
              A modern portal for Hostopia product, sales, and training content —
              all in one place.
            </motion.p>
          </div>
        </motion.section>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto mt-12">
        {highlightBoxes.map((box, index) => {
          const Icon = box.icon;
          return (
            <motion.div
              key={box.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
            >
              <Link
                href={box.href}
                className={cn(
                  "group relative flex flex-col bg-muted/50 backdrop-blur-sm rounded-3xl p-6 sm:p-8 min-h-[220px] w-full overflow-hidden transition-all duration-500",
                  "hover:bg-accent/50 border border-transparent hover:border-primary/20"
                )}
              >
                <div className="absolute top-4 right-4 w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h2
                  className="text-2xl sm:text-3xl font-bold text-primary mt-2 mb-3 group-hover:text-primary/90 transition-colors duration-300 pr-14"
                  style={{ fontFamily: "Montserrat, sans-serif" }}
                >
                  {box.title}
                </h2>
                <p
                  className="text-sm text-muted-foreground flex-1"
                  style={{ fontFamily: "Raleway, sans-serif" }}
                >
                  {box.description}
                </p>
                <div className="mt-4 flex items-center justify-end">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 shadow-lg">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
