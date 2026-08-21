"use client"

import { useState } from 'react'
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "../../../components/ui/button";
import { LogIn, Menu } from "lucide-react";
import { useSession } from 'next-auth/react'
import { handleRegister } from '../_actions/login'

export function Header() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "#profissionais", label: "Profissionais" },
  ];

  async function handleLogin() {
    await handleRegister("google");
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
          Odonto<span className="text-emerald-500">PRO</span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {status === "loading" ? null : session ? (
            <Button asChild variant="outline" size="sm" className="rounded-lg">
              <Link href="/dashboard">Acessar clínica</Link>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleLogin}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Portal da clínica</span>
            </Button>
          )}
        </nav>

        {/* Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Abrir menu">
              <Menu className="w-5 h-5 text-gray-700" />
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-64 p-6 flex flex-col justify-between">
            <div className="space-y-6">
              <SheetHeader className="text-left border-b border-gray-100 pb-4">
                <SheetTitle className="text-lg font-bold">
                  Odonto<span className="text-emerald-500">PRO</span>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-gray-700 hover:text-emerald-600 py-1"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4 border-t border-gray-100">
              {status === "loading" ? null : session ? (
                <Button asChild variant="outline" className="w-full justify-center">
                  <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                    Acessar clínica
                  </Link>
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogin();
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white justify-center flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Portal da clínica</span>
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

      </div>
    </header>
  );
}