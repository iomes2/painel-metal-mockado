"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  ExternalLink,
  FileText,
  Image as LucideImage,
} from "lucide-react";
import { documentDefinitions, DocumentDefinition } from "@/config/documents";
import { useTranslation } from "@/context/language-context";

const translateCategory = (cat: string, lang: string) => {
  if (lang === "en") {
    switch (cat) {
      case "Processo":
        return "Process";
      case "Técnico":
        return "Technical";
      case "Administrativo":
        return "Administrative";
      case "Segurança":
        return "Safety";
      case "Formulário":
        return "Standard Form";
      default:
        return cat;
    }
  }
  return cat;
};

const translateDocument = (doc: DocumentDefinition, lang: string) => {
  if (lang !== "en") return doc;

  let title = doc.title;
  let description = doc.description;

  switch (doc.id) {
    case "fl-003":
      title = "FL-003: Installation Flowchart";
      description = "Detailed flowchart of the on-site installation process.";
      break;
    case "doc-001":
      title = "DOC-001: Project Kick-off Meeting";
      description = "Initial project alignment, manpower planning and machinery.";
      break;
    case "doc-002":
      title = "DOC-002: Pre-Execution Checklist";
      description = "Preliminary verification of site conditions and logistics.";
      break;
    case "doc-003":
      title = "DOC-003: Project Startup Checklist";
      description = "Civil engineering structural inspection and materials receipt.";
      break;
    case "doc-004":
      title = "DOC-004: Loading and Unloading Checklist";
      description = "Cargo control, shipping logistics and vehicle safety verification.";
      break;
    case "doc-005":
      title = "DOC-005: Site Inspection Report";
      description = "Rigging, assembled structure, metal roofing and final checklists.";
      break;
    case "doc-007":
      title = "DOC-007: JSA - Job Safety Analysis";
      description = "Preliminary hazard analysis for rigging, welding, and heights.";
      break;
    case "doc-008":
      title = "DOC-008: Master Construction Schedule";
      description = "Planning of project milestones, phases, and lead times.";
      break;
    case "doc-009":
      title = "DOC-009: Daily Safety Meeting Log";
      description = "Daily safety talk attendance and safety topic registry.";
      break;
    case "doc-010":
      title = "DOC-010: Non-Conformance Report (NCR)";
      description = "Registry of non-conformities and corrective actions.";
      break;
    case "doc-011":
      title = "DOC-011: Special Work Permit (PTW)";
      description = "Permit for hazardous tasks and PPE compliance sheet.";
      break;
    case "doc-012":
      title = "DOC-012: Internal Handover Report";
      description = "Final handover declaration and document dossier checklist.";
      break;
    case "doc-015":
      title = "DOC-015: Project Performance Indicator (KPI)";
      description = "Comparison of planned budget/schedule vs actual progress.";
      break;
    case "doc-020":
      title = "DOC-020: Daily Work Progress Log";
      description = "Daily progress report, milestones tracking and incidents log.";
      break;
  }

  return {
    ...doc,
    title,
    description,
    category: translateCategory(doc.category, lang) as any,
  };
};

export default function DocumentLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { t, language } = useTranslation();

  // Translate all documents
  const translatedDocs = documentDefinitions.map((doc) =>
    translateDocument(doc, language)
  );

  const categories = Array.from(
    new Set(documentDefinitions.map((doc) => doc.category))
  );

  const filteredDocs = translatedDocs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? translateCategory(doc.category, language) === translateCategory(selectedCategory, language)
      : true;
    return matchesSearch && matchesCategory;
  });

  const getIcon = (doc: DocumentDefinition) => {
    if (doc.icon) return <doc.icon className="h-8 w-8 text-primary" />;
    if (doc.type === "pdf")
      return <FileText className="h-8 w-8 text-red-500" />;
    if (doc.type === "image")
      return <LucideImage className="h-8 w-8 text-blue-500" />;
    return <FileText className="h-8 w-8" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          {t("docs_title")}
        </h1>
        <p className="text-slate-500">
          {t("docs_subtitle")}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder={t("docs_search")}
            className="pl-9 bg-white dark:bg-slate-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full max-w-[85vw] md:max-w-full">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
          >
            {t("docs_cat_all")}
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
            >
              {translateCategory(cat, language)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow relative overflow-hidden dark:bg-slate-900/40 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center gap-4 pb-2">
              <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">{getIcon(doc)}</div>
              <div className="flex-1">
                <CardTitle className="text-base line-clamp-1 dark:text-slate-100">
                  {doc.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs mt-1 dark:text-slate-400">
                  {doc.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                  {doc.category}
                </Badge>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      title={language === "pt" ? "Visualizar" : "View"}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="rounded-xl">
                    <a href={doc.fileUrl} download title={t("docs_btn_download")}>
                      <Download className="h-4 w-4 mr-2" />
                      {t("docs_btn_download")}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredDocs.length === 0 && (
          <div className="col-span-full text-center py-10 text-slate-500">
            {t("docs_empty")}
          </div>
        )}
      </div>
    </div>
  );
}
