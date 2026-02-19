import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200",
        secondary: "border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200/80",
        destructive: "border-transparent bg-red-100 text-red-700 hover:bg-red-200/80",
        outline: "text-zinc-950 border-zinc-200",
        success: "border-transparent bg-emerald-100 text-emerald-700 hover:bg-emerald-200/80",
        warning: "border-transparent bg-amber-100 text-amber-700 hover:bg-amber-200/80",
    }

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    )
}

export { Badge }
