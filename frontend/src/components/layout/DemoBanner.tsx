"use client";

import { useState } from "react";
import { X, GraduationCap } from "lucide-react";
import { DEMO_MODE } from "@/lib/mock-data";
import { useTranslation } from "@/context/language-context";

export function DemoBanner() {
  const [visible, setVisible] = useState(true);
  const { t } = useTranslation();

  if (!DEMO_MODE || !visible) return null;

  return (
    <div className="relative z-[60] bg-gradient-to-r from-cyan-600 via-blue-600 to-violet-600 text-white print:hidden">
      <div className="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium">
        <GraduationCap className="h-4 w-4 flex-shrink-0" />
        <span className="text-center">
          <strong>{t("demo_banner_badge")}</strong> — {t("demo_banner_title")}
        </span>
        <button
          onClick={() => setVisible(false)}
          className="ml-2 p-0.5 rounded hover:bg-white/20 transition-colors flex-shrink-0"
          aria-label="Fechar banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
