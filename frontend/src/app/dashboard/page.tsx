"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthInitializer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { formDefinitions } from "@/config/forms";
import { ArrowRight, ClipboardList, Sparkles } from "lucide-react";
import { getFormIcon } from "@/components/icons/icon-resolver";
import { useTranslation } from "@/context/language-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { t, language } = useTranslation();
  const [selectedFormId, setSelectedFormId] = useState<string | null>(null);
  const [selectedFormDefinition, setSelectedFormDefinition] = useState<
    (typeof formDefinitions)[0] | null
  >(null);

  useEffect(() => {
    if (user) {
      window.scrollTo(0, 0);
    }
  }, [user]);

  useEffect(() => {
    if (selectedFormId) {
      const definition = formDefinitions.find(
        (form) => form.id === selectedFormId
      );
      setSelectedFormDefinition(definition || null);
    } else {
      setSelectedFormDefinition(null);
    }
  }, [selectedFormId]);

  if (!user) {
    return null;
  }

  const userName =
    user.displayName || user.email?.split("@")[0]?.split(".")[0] || "Gerente";

  const handleOpenForm = () => {
    if (selectedFormId) {
      router.push(`/dashboard/forms/${selectedFormId}`);
    }
  };

  const IconComponent = selectedFormDefinition
    ? getFormIcon(selectedFormDefinition.iconName)
    : ClipboardList;

  return (
    <div className="overflow-y-auto overflow-x-hidden max-w-full">
      {/* Welcome Banner - Compact */}
      <div className="welcome-banner mb-4 animate-fade-in-up">
        <div className="welcome-banner-content">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 opacity-80" />
            <span className="text-xs sm:text-sm font-medium opacity-80">
              {t("system_forms")}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
            {language === "pt" ? `Olá, ${userName}!` : `Hello, ${userName}!`}
          </h1>
          <p className="text-sm sm:text-base opacity-90">
            {t("dash_subtitle")}
          </p>
        </div>
      </div>

      {/* Form Selection Card - Compact, expands only when form selected */}
      <div
        className="dashboard-card p-4 sm:p-5 animate-fade-in-up"
        style={{ animationDelay: "0.1s" }}
      >
        <h2 className="section-title mb-3">
          <ClipboardList className="section-title-icon" />
          <span>{t("dash_form_label")}</span>
        </h2>

        <p className="text-sm text-muted-foreground mb-3">
          {t("dash_subtitle")}.
        </p>

        {/* Select with large touch target */}
        <div className="mb-4">
          <Select
            onValueChange={setSelectedFormId}
            value={selectedFormId || undefined}
          >
            <SelectTrigger className="w-full h-12 sm:h-14 text-base touch-target-lg rounded-xl border-2 border-border hover:border-primary/50 focus:border-primary transition-colors px-4">
              <SelectValue placeholder={t("dash_form_placeholder")} />
            </SelectTrigger>
            <SelectContent className="max-h-[50vh]">
              {formDefinitions.map((form) => {
                const CurrentFormIcon = getFormIcon(form.iconName);
                // Translate form names if in English (appropriate TCC terms)
                let translatedName = form.name;
                let translatedDesc = form.description;
                if (language === "en") {
                  if (form.id === "relatorio-diario-obra" || form.id === "cronograma-diario-obra") {
                    translatedName = "Daily Work Progress Log";
                    translatedDesc = "Daily progress tracker of work activities on site.";
                  } else if (form.id === "relatorio-inspecao-site") {
                    translatedName = "Site Inspection Report";
                    translatedDesc = "Safety and quality inspection checklists.";
                  } else if (form.id === "registro-nao-conformidade") {
                    translatedName = "Non-Conformance Report (NCR)";
                    translatedDesc = "Document structural or procedural non-conformity.";
                  } else if (form.id === "permissao-trabalho-altura") {
                    translatedName = "Work at Height Permit";
                    translatedDesc = "Safety compliance validation for heights.";
                  }
                }
                return (
                  <SelectItem
                    key={form.id}
                    value={form.id}
                    className="py-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <CurrentFormIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-base">{translatedName}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Form Preview - Only shows when form is selected */}
        {selectedFormDefinition && (
          <div className="mb-4 p-4 rounded-xl bg-muted/30 border border-border/50 animate-fade-in-up overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <h3 className="text-sm sm:text-base font-semibold text-foreground">
                  {language === "en" && (selectedFormId === "relatorio-diario-obra" || selectedFormId === "cronograma-diario-obra") ? "Daily Work Progress Log" : 
                   language === "en" && selectedFormId === "relatorio-inspecao-site" ? "Site Inspection Report" :
                   language === "en" && selectedFormId === "registro-nao-conformidade" ? "Non-Conformance Report (NCR)" :
                   language === "en" && selectedFormId === "permissao-trabalho-altura" ? "Work at Height Permit" :
                   selectedFormDefinition.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {language === "en" && (selectedFormId === "relatorio-diario-obra" || selectedFormId === "cronograma-diario-obra") ? "Daily progress tracker of work activities on site." :
                   language === "en" && selectedFormId === "relatorio-inspecao-site" ? "Safety and quality inspection checklists." :
                   language === "en" && selectedFormId === "registro-nao-conformidade" ? "Document structural or procedural non-conformity." :
                   language === "en" && selectedFormId === "permissao-trabalho-altura" ? "Safety compliance validation for heights." :
                   selectedFormDefinition.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Button - Right after select or preview */}
        <Button
          onClick={handleOpenForm}
          disabled={!selectedFormId}
          size="lg"
          className="w-full h-12 sm:h-14 text-base rounded-xl touch-target-lg bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <span>{t("dash_btn_open")}</span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
