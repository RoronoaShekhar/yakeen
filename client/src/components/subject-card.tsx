
import { LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getSubjectColor, getSubjectIcon } from "@/lib/utils";
import React from "react";

interface SubjectCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export default function SubjectCard({ name, description, icon: Icon, color, onClick }: SubjectCardProps) {
  return (
    <Card
      className="group cursor-pointer transition-all duration-500 hover:shadow-2xl sm:hover:-translate-y-3 overflow-hidden border-0 card-hover relative bg-white/80 backdrop-blur-sm"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className={`h-24 sm:h-28 lg:h-32 ${color} relative flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
        <Icon className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 text-white group-hover:scale-125 transition-all duration-500 relative z-10 drop-shadow-lg" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Shimmer effect - disabled on mobile for performance */}
        <div className="hidden sm:block absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>

      <CardContent className="p-4 sm:p-5 lg:p-6 relative">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-300 flex items-center gap-2">
          {name}
          <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
        </h3>
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed group-hover:text-gray-700 transition-colors duration-300 line-clamp-2">
          {description}
        </p>

        {/* Decorative element */}
        <div className="absolute bottom-0 left-4 right-4 sm:left-5 sm:right-5 lg:left-6 lg:right-6 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </CardContent>
    </Card>
  );
}
