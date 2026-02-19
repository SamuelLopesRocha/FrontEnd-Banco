import { ReactNode } from "react";

export interface NavItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

export interface MobileNavProps {
  icon: ReactNode;
  label: string;
  href: string;
  active?: boolean;
}