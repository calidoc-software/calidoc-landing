"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { TextField, type TextFieldProps } from "./TextField";

export function PasswordField(props: Omit<TextFieldProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          className="inline-flex size-10 items-center justify-center rounded-lg text-neutral-500 transition-colors duration-200 hover:text-neutral-900"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      }
    />
  );
}
