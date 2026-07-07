"use client";

import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type Language = "pt" | "en";

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
  };
}

const translations: Translations = {
  // Demo Banner
  demo_banner_title: {
    pt: "Versão Demo — TCC Renan Iomes • Engenharia de Software • Dados simulados",
    en: "Demo Version — Renan Iomes Graduation Project • Software Engineering • Simulated Data",
  },
  demo_banner_badge: {
    pt: "Versão Demo",
    en: "Demo Version",
  },

  // Login Page
  login_title: {
    pt: "Login do Gerente",
    en: "Manager Login",
  },
  login_desc_demo: {
    pt: "🎓 Versão Demo — TCC. Insira qualquer usuário e senha para acessar o painel. Dados simulados • Sem conexão real.",
    en: "🎓 Demo Version — Graduation Project. Enter any username and password to access the panel. Simulated data • No real connection.",
  },
  login_id_label: {
    pt: "ID Gerente",
    en: "Manager ID",
  },
  login_id_placeholder: {
    pt: "Qualquer valor...",
    en: "Any value...",
  },
  login_pass_label: {
    pt: "Senha",
    en: "Password",
  },
  login_submit: {
    pt: "Entrar",
    en: "Sign In",
  },
  login_footer: {
    pt: "Entre em contato com o suporte se tiver problemas para fazer login.",
    en: "Contact support if you have trouble signing in.",
  },
  login_success: {
    pt: "Login realizado com sucesso! (Modo Demo)",
    en: "Login successful! (Demo Mode)",
  },
  login_error_missing: {
    pt: "ID Gerente e Senha são obrigatórios.",
    en: "Manager ID and Password are required.",
  },

  // Sidebar
  menu_dashboard: {
    pt: "Painel",
    en: "Dashboard",
  },
  menu_query: {
    pt: "Consultar",
    en: "Query Reports",
  },
  menu_monitoring: {
    pt: "Monitoramento",
    en: "Monitoring",
  },
  menu_documents: {
    pt: "Documentos",
    en: "Documents Library",
  },
  system_forms: {
    pt: "Sistema de Formulários",
    en: "Form Management System",
  },

  // Header / Notifications
  notifications_title: {
    pt: "Notificações",
    en: "Notifications",
  },
  notifications_read_all: {
    pt: "Ler todas",
    en: "Mark all as read",
  },
  notifications_empty: {
    pt: "Nenhuma notificação",
    en: "No notifications",
  },
  notifications_details: {
    pt: "Ver detalhes",
    en: "View details",
  },
  notifications_mark_read: {
    pt: "Marcar como lida",
    en: "Mark as read",
  },
  notification_new_report_title: {
    pt: "Novo relatório enviado",
    en: "New report submitted",
  },
  notification_new_report_msg: {
    pt: "Carlos Souza enviou o Diário de Obra para OS-2024-001.",
    en: "Carlos Souza submitted the Daily Work Log for OS-2024-001.",
  },
  user_nav_welcome: {
    pt: "Olá",
    en: "Hello",
  },
  user_nav_logout: {
    pt: "Sair",
    en: "Logout",
  },
  user_nav_logout_success: {
    pt: "Você foi desconectado com sucesso.",
    en: "You have been successfully disconnected.",
  },

  // Dashboard Page
  dash_welcome: {
    pt: "Olá, Gerente Demo!",
    en: "Hello, Demo Manager!",
  },
  dash_subtitle: {
    pt: "Selecione um formulário para começar a preencher",
    en: "Select a form to start filling out",
  },
  dash_os_label: {
    pt: "1. Selecione a Ordem de Serviço (OS)",
    en: "1. Select Work Order (OS)",
  },
  dash_os_placeholder: {
    pt: "Selecione uma OS...",
    en: "Select an OS...",
  },
  dash_form_label: {
    pt: "2. Escolha o Formulário de Processo",
    en: "2. Choose Process Form",
  },
  dash_form_placeholder: {
    pt: "Selecione um formulário...",
    en: "Select a form...",
  },
  dash_btn_open: {
    pt: "Abrir Formulário",
    en: "Open Form",
  },
  dash_error_select: {
    pt: "Por favor, selecione uma OS e um tipo de formulário.",
    en: "Please select an OS and a form type.",
  },

  // Search / Consultar Page
  search_title: {
    pt: "Consultar Relatórios",
    en: "Query Reports",
  },
  search_subtitle: {
    pt: "Busque por OS ou por gerente responsável",
    en: "Search by Work Order (OS) or responsible manager",
  },
  search_os_placeholder: {
    pt: "Buscar por OS (ex: OS-2024-001)",
    en: "Search by OS (e.g. OS-2024-001)",
  },
  search_os_btn: {
    pt: "Buscar OS",
    en: "Search OS",
  },
  search_manager_placeholder: {
    pt: "Selecione um gerente...",
    en: "Select a manager...",
  },
  search_manager_loading: {
    pt: "Carregando gerentes...",
    en: "Loading managers...",
  },
  search_manager_empty: {
    pt: "Nenhum gerente encontrado",
    en: "No managers found",
  },
  search_manager_btn: {
    pt: "Buscar por Gerente",
    en: "Search by Manager",
  },
  search_results_title: {
    pt: "Relatórios para OS",
    en: "Reports for OS",
  },
  search_results_count: {
    pt: "relatório(s) encontrado(s).",
    en: "report(s) found.",
  },
  search_table_name: {
    pt: "Nome do Formulário",
    en: "Form Name",
  },
  search_table_date: {
    pt: "Data",
    en: "Date",
  },
  search_table_photos: {
    pt: "Fotos",
    en: "Photos",
  },
  search_table_actions: {
    pt: "Ações",
    en: "Actions",
  },
  search_btn_view: {
    pt: "Ver",
    en: "View",
  },
  search_empty_os: {
    pt: "Nenhum relatório encontrado para a OS",
    en: "No reports found for OS",
  },
  search_empty_manager: {
    pt: "Nenhuma Ordem de Serviço encontrada para o gerente",
    en: "No Work Orders found for manager",
  },
  search_manager_os_title: {
    pt: "Ordens de Serviço para Gerente",
    en: "Work Orders for Manager",
  },
  search_manager_os_count: {
    pt: "OS(s) encontrada(s).",
    en: "OS found.",
  },
  search_table_os: {
    pt: "Ordem de Serviço (OS)",
    en: "Work Order (OS)",
  },
  search_table_last_report: {
    pt: "Último Envio",
    en: "Last Submission",
  },
  search_error_auth: {
    pt: "Você precisa estar logado para pesquisar.",
    en: "You need to be logged in to search.",
  },
  search_error_required: {
    pt: "Por favor, insira uma Ordem de Serviço para pesquisar.",
    en: "Please enter a Work Order to search.",
  },
  search_error_select_mgr: {
    pt: "Por favor, selecione um gerente para pesquisar.",
    en: "Please select a manager to search.",
  },

  // Monitoring Page
  mon_title: {
    pt: "Painel de Monitoramento",
    en: "Analytics Dashboard",
  },
  mon_subtitle: {
    pt: "Acompanhe métricas e relatórios em tempo real",
    en: "Track metrics and reports in real time",
  },
  mon_export: {
    pt: "Exportar Excel",
    en: "Export Excel",
  },
  mon_exporting: {
    pt: "Exportando...",
    en: "Exporting...",
  },
  mon_card_forms: {
    pt: "Formulários",
    en: "Forms",
  },
  mon_card_forms_sub: {
    pt: "Registrados no sistema",
    en: "Registered in system",
  },
  mon_card_pending: {
    pt: "Pendentes",
    en: "Pending Review",
  },
  mon_card_pending_sub: {
    pt: "Aguardando revisão",
    en: "Awaiting review",
  },
  mon_card_users: {
    pt: "Usuários",
    en: "Users",
  },
  mon_card_users_sub: {
    pt: "Cadastrados",
    en: "Registered",
  },
  mon_card_approval: {
    pt: "Aprovação",
    en: "Approval Rate",
  },
  mon_card_approval_sub: {
    pt: "Taxa",
    en: "Rate",
  },
  mon_chart_monthly: {
    pt: "Formulários por Mês",
    en: "Forms by Month",
  },
  mon_chart_status: {
    pt: "Status dos Relatórios",
    en: "Reports Status",
  },
  mon_chart_types: {
    pt: "Tipos de Formulários",
    en: "Forms by Type",
  },
  mon_loading: {
    pt: "Carregando dados...",
    en: "Loading metrics...",
  },
  mon_export_success: {
    pt: "Relatório exportado!",
    en: "Report exported!",
  },
  mon_export_desc: {
    pt: "registros exportados com sucesso",
    en: "records successfully exported",
  },

  // Documents Page
  docs_title: {
    pt: "Biblioteca de Documentos",
    en: "Document Library",
  },
  docs_subtitle: {
    pt: "Acesse e baixe os documentos padrões, fluxogramas e manuais.",
    en: "Access and download standard documents, flowcharts, and manuals.",
  },
  docs_search: {
    pt: "Buscar documentos...",
    en: "Search documents...",
  },
  docs_cat_all: {
    pt: "Todos",
    en: "All",
  },
  docs_btn_download: {
    pt: "Baixar",
    en: "Download",
  },
  docs_empty: {
    pt: "Nenhum documento encontrado.",
    en: "No documents found.",
  },

  // Dynamic Form Renderer (UI)
  form_required_alert: {
    pt: "Você precisa estar logado para enviar formulários.",
    en: "You need to be logged in to submit forms.",
  },
  form_auth_error: {
    pt: "Erro de Autenticação",
    en: "Authentication Error",
  },
  form_success_toast_title: {
    pt: "Formulário Enviado",
    en: "Form Submitted",
  },
  form_success_toast_desc: {
    pt: "Formulário enviado com sucesso!",
    en: "Form submitted successfully!",
  },
  form_error_toast_title: {
    pt: "Erro ao enviar",
    en: "Submission Error",
  },
  form_dialog_title: {
    pt: "Formulário Enviado com Sucesso!",
    en: "Form Submitted Successfully!",
  },
  form_dialog_desc: {
    pt: "O formulário foi enviado com sucesso para a OS",
    en: "The form was successfully submitted for OS",
  },
  form_dialog_pdf_prompt: {
    pt: "Deseja baixar a via do relatório em PDF?",
    en: "Would you like to download the PDF copy of the report?",
  },
  form_dialog_btn_download: {
    pt: "Sim, Baixar PDF",
    en: "Yes, Download PDF",
  },
  form_dialog_btn_dashboard: {
    pt: "Não, Voltar ao Início",
    en: "No, Back to Dashboard",
  },
  form_btn_submit: {
    pt: "Enviar Formulário",
    en: "Submit Form",
  },
  form_btn_submitting: {
    pt: "Enviando...",
    en: "Submitting...",
  },
  form_back: {
    pt: "Voltar para o Painel",
    en: "Back to Dashboard",
  },
  form_not_found: {
    pt: "Erro: Formulário Não Encontrado",
    en: "Error: Form Not Found",
  },
  form_not_found_desc: {
    pt: "O tipo de formulário não pôde ser encontrado. Por favor, verifique o URL ou selecione um formulário válido.",
    en: "The form type could not be found. Please check the URL or select a valid form.",
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("demo_lang") as Language;
      if (stored === "pt" || stored === "en") {
        setLanguageState(stored);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("demo_lang", lang);
    }
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translation[language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
