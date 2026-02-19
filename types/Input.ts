import { ChangeEventHandler, ReactNode } from "react";

export interface InputProps {
  name: string;
  placeholder?: string;
  type?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  required?: boolean;
  icon?: ReactNode;
}