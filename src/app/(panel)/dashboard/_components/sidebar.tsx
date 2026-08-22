"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import logoImg from '../../../../../public/logo-h.png'
import logoIcon from '../../../../../public/logo-odonto.png'
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Settings,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Menu,
  Stethoscope,
  BarChart3,
  Calendar,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { getPermissionUserToReports } from "../reports/_data-access/get-permission-reprots";
import Image from "next/image";

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category?: string;
}

export function SidebarDashboard({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [hasReportAccess, setHasReportAccess] = useState(false);
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function checkPermission() {
      if (session?.user?.id) {
        const hasAccess = await getPermissionUserToReports({ userId: session.user.id });
        setHasReportAccess(Boolean(hasAccess));
      }
    }

    checkPermission();
  }, [session?.user?.id]);

  const NAVIGATION_ITEMS: NavigationItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      category: "Painel",
    },
    {
      href: "/dashboard/agenda",
      label: "Agenda",
      icon: Calendar,
      category: "Painel",
    },
    {
      href: "/dashboard/services",
      label: "Serviços",
      icon: Stethoscope,
      category: "Painel",
    },
    {
      href: "/dashboard/patients",
      label: "Pacientes",
      icon: Users,
      category: "Painel",
    },
    ...(hasReportAccess
      ? [
        {
          href: "/dashboard/reports",
          label: "Relatórios",
          icon: BarChart3,
          category: "Painel",
        },
      ]
      : []),
    {
      href: "/dashboard/profile",
      label: "Meu perfil",
      icon: Settings,
      category: "Configurações",
    },
    {
      href: "/dashboard/plans",
      label: "Planos",
      icon: Banknote,
      category: "Configurações",
    },
  ];

  return (
    <TooltipProvider>
      <div className="min-h-screen w-full bg-gray-50/50 flex flex-col md:flex-row">
        {/* Sidebar Desktop */}
        <aside
          className={clsx(
            "hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-100 z-40 transition-all duration-300 p-4 justify-between",
            {
              "w-25": isCollapsed,
              "w-64": !isCollapsed,
            }
          )}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-center px-2 py-4">
              {!isCollapsed ? (
                <Link href="/dashboard" className="flex items-center font-bold text-lg text-gray-900">
                  <Image
                    src={logoImg}
                    alt="OdontoPRO Logo"
                    className="w-auto h-24 md:h-12 transition-all duration-300"
                  />
                </Link>
              ) : (
                <Link href="/dashboard" className="flex items-center font-bold text-lg text-gray-900">
                  <div className="object-cover w-25 h-25 md:w-16 md:h-16 rounded-lg text-white mx-auto cursor-pointer transition-all duration-300">
                    <Image
                      src={logoIcon}
                      alt="OdontoPRO Logo"
                      quality={100}
                      priority
                      className="object-contain w-full h-full scale-125"
                    />
                  </div>
                </Link>
              )}
          </div>

            {/* Navegação */}
            <nav className="space-y-4">
              {NAVIGATION_ITEMS.reduce<{ category: string; items: NavigationItem[] }[]>(
                (acc, item) => {
                  const catName = item.category || "Menu";
                  const existing = acc.find((c) => c.category === catName);
                  if (existing) {
                    existing.items.push(item);
                  } else {
                    acc.push({ category: catName, items: [item] });
                  }
                  return acc;
                },
                []
              ).map((group, idx) => (
                <div key={idx} className="space-y-1">
                  {!isCollapsed && (
                    <span className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                      {group.category}
                    </span>
                  )}
                  {group.items.map((item) => (
                    <SidebarLink
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      pathname={pathname}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </div>
              ))}
            </nav>
          </div>

          {/* Botão de Toggle Recolher/Expandir */}
          <div className="pt-4 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg h-9"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="text-xs font-medium">Recolher menu</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Content Wrapper */}
        <div
          className={clsx("flex flex-1 flex-col transition-all duration-300 min-w-0", {
            "md:ml-20": isCollapsed,
            "md:ml-64": !isCollapsed,
          })}
        >
          {/* Header Mobile */}
          <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <Image
                src={logoImg}
                alt="OdontoPRO Logo"
                className="h-8 w-auto"
              />
            </div>

            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Abrir menu">
                  <Menu className="w-5 h-5 text-gray-700" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-64 p-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <SheetHeader className="text-left border-b border-gray-100 pb-4">
                    <SheetTitle className="text-base font-bold text-gray-900">
                      Painel Administrativo
                    </SheetTitle>
                    <SheetDescription className="text-xs">
                      Gerencie sua clínica
                    </SheetDescription>
                  </SheetHeader>

                  <nav className="space-y-5">
                    {NAVIGATION_ITEMS.map((item) => (
                      <SidebarLink
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        icon={item.icon}
                        pathname={pathname}
                        isCollapsed={false}
                        onClick={() => setIsMobileOpen(false)}
                      />
                    ))}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          {/* Área Principal de Conteúdo */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>

      </div>
    </TooltipProvider>
  );
}

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  pathname: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  pathname,
  isCollapsed,
  onClick,
}: SidebarLinkProps) {
  const isActive = pathname === href;

  const content = (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden scroll-smooth",
        {
          "bg-emerald-50/80 text-emerald-700 font-semibold before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:bg-emerald-500 before:rounded-r-md": isActive && !isCollapsed,
          "bg-emerald-50/80 text-emerald-700 font-semibold": isActive && isCollapsed,
          "text-gray-500 hover:bg-gray-50 hover:text-gray-900": !isActive,
          "justify-center px-0": isCollapsed,
        }
      )}
    >
      <Icon className={clsx("shrink-0", { "w-5 h-5": !isCollapsed, "w-6 h-6": isCollapsed })} />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-medium text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}