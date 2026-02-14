import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-zinc-900">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-zinc-500 mt-1">
                        {trend && <span className="text-green-500 font-medium mr-1">{trend}</span>}
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
