import { InputProps } from "@/types/Input";

export default function Input({
    name,
    placeholder,
    type = "text",
    onChange,
    required = true,
    icon,
}: InputProps) {
    return (
        <div className="relative group w-full">

            {icon && (
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#CFAA56] transition-colors">
                    {icon}
                </div>
            )}

            <input
                type={type}
                name={name}
                placeholder={placeholder}
                onChange={onChange}
                required={required}
                className={`
          w-full
          ${icon ? "pl-14" : "px-6"} py-4 rounded-xl
          bg-white/[0.02] border border-white/[0.06]
          text-white text-sm outline-none
          focus:border-[#CFAA56]/40 focus:bg-white/[0.04]
          transition-all duration-300
        `}
            />
        </div>
    );
}