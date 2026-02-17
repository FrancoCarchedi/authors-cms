import {
  LayoutDashboard,
  User,
  Users,
  FileText,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Artículos",
    href: "/articles",
    icon: FileText,
  },
  {
    label: "Mi perfil",
    href: "/profile",
    icon: User,
  },
]
