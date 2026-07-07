/**
 * Mock Data — Dados simulados para modo demo
 *
 * Este arquivo contém todos os dados mockados para o modo demo do Painel Metalgalvano.
 * Utilizado quando NEXT_PUBLIC_DEMO_MODE=true, sem necessidade de Firebase ou backend.
 */

import type { Gerente, ReportData, OsData, ReportPhoto, UserProfile, AppNotification } from "./api-client";

// ==================== DEMO MODE FLAG ====================

export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

// ==================== MOCK USER ====================

export const MOCK_USER = {
  uid: "demo-user-001",
  email: "demo@metalgalvano.com",
  displayName: "Gerente Demo",
  emailVerified: true,
  isAnonymous: false,
  photoURL: null,
  phoneNumber: null,
  tenantId: null,
  providerId: "firebase",
  metadata: {},
  providerData: [],
  refreshToken: "demo-refresh-token",
  getIdToken: async () => "demo-token-mock",
  getIdTokenResult: async () => ({
    token: "demo-token-mock",
    claims: {},
    expirationTime: new Date(Date.now() + 3600000).toISOString(),
    authTime: new Date().toISOString(),
    issuedAtTime: new Date().toISOString(),
    signInProvider: "password",
    signInSecondFactor: null,
  }),
  toJSON: () => ({}),
  delete: async () => {},
  reload: async () => {},
};

export const MOCK_USER_PROFILE: UserProfile = {
  id: "demo-user-001",
  email: "demo@metalgalvano.com",
  name: "Gerente Demo",
  role: "ADMIN",
  isActive: true,
  createdAt: "2024-01-15T10:00:00Z",
};

// ==================== GERENTES ====================

export const MOCK_GERENTES: Gerente[] = [
  { id: "mg01", nome: "Carlos Souza" },
  { id: "mg02", nome: "Maria Oliveira" },
  { id: "mg03", nome: "João Santos" },
  { id: "mg04", nome: "Ana Costa" },
  { id: "demo", nome: "Gerente Demo" },
];

// ==================== ORDENS DE SERVIÇO ====================

const createTimestamp = (dateStr: string) => {
  const date = new Date(dateStr);
  return {
    toDate: () => date,
    toMillis: () => date.getTime(),
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  };
};

export const MOCK_OS_BY_GERENTE: Record<string, OsData[]> = {
  mg01: [
    { id: "OS-2024-001", os: "OS-2024-001", lastReportAt: createTimestamp("2025-06-10T14:30:00Z") as any },
    { id: "OS-2024-003", os: "OS-2024-003", lastReportAt: createTimestamp("2025-06-08T09:15:00Z") as any },
    { id: "OS-2024-005", os: "OS-2024-005", lastReportAt: createTimestamp("2025-05-28T11:00:00Z") as any },
  ],
  mg02: [
    { id: "OS-2024-002", os: "OS-2024-002", lastReportAt: createTimestamp("2025-06-12T16:45:00Z") as any },
    { id: "OS-2024-004", os: "OS-2024-004", lastReportAt: createTimestamp("2025-06-01T08:00:00Z") as any },
  ],
  mg03: [
    { id: "OS-2024-001", os: "OS-2024-001", lastReportAt: createTimestamp("2025-06-09T10:20:00Z") as any },
  ],
  mg04: [
    { id: "OS-2024-005", os: "OS-2024-005", lastReportAt: createTimestamp("2025-05-30T13:00:00Z") as any },
  ],
  demo: [
    { id: "OS-2024-001", os: "OS-2024-001", lastReportAt: createTimestamp("2025-06-12T14:30:00Z") as any },
    { id: "OS-2024-002", os: "OS-2024-002", lastReportAt: createTimestamp("2025-06-11T09:15:00Z") as any },
    { id: "OS-2024-003", os: "OS-2024-003", lastReportAt: createTimestamp("2025-06-08T11:00:00Z") as any },
  ],
};

// ==================== MOCK PHOTOS ====================

const MOCK_PHOTOS: ReportPhoto[] = [
  {
    id: "photo-001",
    name: "foto_obra_frente.jpg",
    url: "https://placehold.co/800x600/0ea5e9/white?text=Foto+Obra+1",
    type: "image/jpeg",
    size: 245000,
  },
  {
    id: "photo-002",
    name: "foto_estrutura_metalica.jpg",
    url: "https://placehold.co/800x600/22c55e/white?text=Foto+Obra+2",
    type: "image/jpeg",
    size: 312000,
  },
  {
    id: "photo-003",
    name: "foto_instalacao.jpg",
    url: "https://placehold.co/800x600/f59e0b/white?text=Foto+Obra+3",
    type: "image/jpeg",
    size: 198000,
  },
];

// ==================== RELATÓRIOS ====================

export const MOCK_RELATORIOS: Record<string, ReportData[]> = {
  "OS-2024-001": [
    {
      id: "report-001",
      formName: "DOC-020: Acompanhamento de Cronograma e Diário de Obra",
      formType: "cronograma-diario-obra",
      submittedAt: createTimestamp("2025-06-10T14:30:00Z") as any,
      formData: {
        dataInicial: createTimestamp("2025-05-01T00:00:00Z"),
        dataFinalProjetada: createTimestamp("2025-07-30T00:00:00Z"),
        ordemServico: "OS-2024-001",
        etapaDescricao: "Montagem da Estrutura Metálica - Galpão A",
        dataAtual: createTimestamp("2025-06-10T00:00:00Z"),
        situacaoEtapa: "em_dia",
        equipamentosUtilizados: "Guindaste 30t, Soldadora MIG, Parafusadeira Pneumática",
        fotosEtapa: "S",
        uploadFotos: [MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
        emissaoRNC: "N",
        equipeTrabalho: "Carlos Souza (Líder), Pedro Lima, Marcos Silva, Rafael Nunes",
        pteEmitida: "N",
        tempoTotalTrabalho: "8h (07:30 às 17:30)",
        horarioInicioJornada: "07:30",
        horarioEfetivoInicio: "07:30",
        horarioTerminoJornada: "17:30",
        horarioEfetivoSaida: "17:30",
      },
      photoUrls: [MOCK_PHOTOS[0], MOCK_PHOTOS[1]],
      submittedBy: "mg01",
      gerenteId: "mg01",
    },
    {
      id: "report-002",
      formName: "DOC-001: Reunião de Projeto",
      formType: "doc-001-reuniao-projeto",
      submittedAt: createTimestamp("2025-05-15T10:00:00Z") as any,
      formData: {
        dataReuniao: createTimestamp("2025-05-15T00:00:00Z"),
        ordemServico: "OS-2024-001",
        projetista: "Eng. Roberto Mendes",
        gerenteObra: "Carlos Souza",
        cliente: "Construtora ABC Ltda",
        local: "Rua das Indústrias, 450 - Joinville/SC",
        tipoObra: "Galpão Industrial 1.200m²",
        prazoExecucaoDias: 90,
        dataInicialProgramada: createTimestamp("2025-05-01T00:00:00Z"),
        dataFinalProgramada: createTimestamp("2025-07-30T00:00:00Z"),
        projetoApresentado: "S",
        obsProjetoApresentado: "Projeto revisado e aprovado pelo gerente",
        equipeInternaDefinida: "S",
        liderEquipe: "Carlos Souza",
        montadorEquipe: "Pedro Lima, Marcos Silva",
        auxiliarEquipe: "Rafael Nunes, Thiago Ferreira",
      },
      photoUrls: [],
      submittedBy: "mg01",
      gerenteId: "mg01",
    },
    {
      id: "report-003",
      formName: "Relatório de Inspeção de Site",
      formType: "relatorio-inspecao-site",
      submittedAt: createTimestamp("2025-06-08T16:00:00Z") as any,
      formData: {
        dataRelatorioInspecao: createTimestamp("2025-06-08T00:00:00Z"),
        ordemServico: "OS-2024-001",
        inspetorNome: "Carlos Souza",
        areaInspecionada: "Canteiro de obras - Setor B",
        conformidadeSeguranca: "sim",
        fotosInspecao: "sim",
        uploadFotosInspecao: [MOCK_PHOTOS[2]],
        observacoesGeraisInspecao: "Área em conformidade. EPIs sendo utilizados corretamente pela equipe.",
      },
      photoUrls: [MOCK_PHOTOS[2]],
      submittedBy: "mg03",
      gerenteId: "mg03",
    },
  ],
  "OS-2024-002": [
    {
      id: "report-004",
      formName: "DOC-020: Acompanhamento de Cronograma e Diário de Obra",
      formType: "cronograma-diario-obra",
      submittedAt: createTimestamp("2025-06-12T16:45:00Z") as any,
      formData: {
        dataInicial: createTimestamp("2025-04-15T00:00:00Z"),
        dataFinalProjetada: createTimestamp("2025-08-15T00:00:00Z"),
        ordemServico: "OS-2024-002",
        etapaDescricao: "Cobertura Metálica - Edifício Comercial",
        dataAtual: createTimestamp("2025-06-12T00:00:00Z"),
        situacaoEtapa: "em_atraso",
        motivoAtraso: "Atraso na entrega de perfis W 250x32,7 pelo fornecedor",
        equipamentosUtilizados: "Plataforma Elevatória, Soldadora TIG",
        fotosEtapa: "N",
        emissaoRNC: "S",
        equipeTrabalho: "Maria Oliveira (Líder), Ana Costa, Lucas Barbosa",
        pteEmitida: "S",
        tempoTotalTrabalho: "6h (08:00 às 16:00)",
        horasRetrabalho: "2h",
        motivoRetrabalho: "Ajuste de alinhamento na terça metálica",
      },
      photoUrls: [],
      submittedBy: "mg02",
      gerenteId: "mg02",
    },
    {
      id: "report-005",
      formName: "DOC-009: Diálogo de Segurança - DDS",
      formType: "doc-009-dds",
      submittedAt: createTimestamp("2025-06-12T08:00:00Z") as any,
      formData: {
        dataDDS: createTimestamp("2025-06-12T00:00:00Z"),
        ordemServico: "OS-2024-002",
        tema: "Trabalho em altura - uso correto do cinto de segurança",
        instrutor: "Maria Oliveira",
        participantes: "Ana Costa, Lucas Barbosa, Felipe Rocha, Gustavo Lima",
        observacoes: "Todos os colaboradores demonstraram conhecimento sobre o uso correto dos EPIs.",
      },
      photoUrls: [],
      submittedBy: "mg02",
      gerenteId: "mg02",
    },
    {
      id: "report-005-pte",
      formName: "DOC-011: Permissão de Trabalho Especial (PTE)",
      formType: "doc-011-pte",
      submittedAt: createTimestamp("2025-06-12T09:00:00Z") as any,
      formData: {
        dataEmissao: createTimestamp("2025-06-12T00:00:00Z"),
        ordemServico: "OS-2024-002",
        localTrabalho: "Edifício Comercial - Cobertura",
        descricaoAtividade: "Instalação de estrutura e trabalho em altura",
        riscosIdentificados: ["Queda de altura", "Queda de materiais"],
        epiObrigatorio: ["Cinto de segurança tipo paraquedista", "Capacete com jugular", "Luvas de vaqueta"],
        autorizadoPor: "Maria Oliveira",
        status: "Aprovado",
      },
      photoUrls: [],
      submittedBy: "mg02",
      gerenteId: "mg02",
    },
  ],
  "OS-2024-003": [
    {
      id: "report-006",
      formName: "DOC-020: Acompanhamento de Cronograma e Diário de Obra",
      formType: "cronograma-diario-obra",
      submittedAt: createTimestamp("2025-06-08T09:15:00Z") as any,
      formData: {
        dataInicial: createTimestamp("2025-06-01T00:00:00Z"),
        dataFinalProjetada: createTimestamp("2025-09-01T00:00:00Z"),
        ordemServico: "OS-2024-003",
        etapaDescricao: "Fundação e Bases de Concreto",
        dataAtual: createTimestamp("2025-06-08T00:00:00Z"),
        situacaoEtapa: "em_dia",
        equipamentosUtilizados: "Retroescavadeira, Betoneira 400L",
        fotosEtapa: "S",
        uploadFotos: [MOCK_PHOTOS[0]],
        emissaoRNC: "N",
        equipeTrabalho: "João Santos (Líder), Ricardo Mendes",
        pteEmitida: "N",
        tempoTotalTrabalho: "9h (07:00 às 17:00)",
      },
      photoUrls: [MOCK_PHOTOS[0]],
      submittedBy: "mg01",
      gerenteId: "mg01",
    },
  ],
  "OS-2024-004": [
    {
      id: "report-007",
      formName: "DOC-002: Checklist Pré-Obra",
      formType: "doc-002-checklist-pre-obra",
      submittedAt: createTimestamp("2025-06-01T08:00:00Z") as any,
      formData: {
        dataChecklist: createTimestamp("2025-06-01T00:00:00Z"),
        ordemServico: "OS-2024-004",
        responsavel: "Maria Oliveira",
        condicoesCanteiro: "Adequado",
        acessoVeiculos: "S",
        energiaDisponivel: "S",
        aguaDisponivel: "S",
        banheirosQuimicos: "S",
        observacoes: "Local pronto para início da obra. Documentação entregue ao cliente.",
      },
      photoUrls: [],
      submittedBy: "mg02",
      gerenteId: "mg02",
    },
  ],
  "OS-2024-005": [
    {
      id: "report-008",
      formName: "DOC-012: Relatório Interno de Conclusão de Obra",
      formType: "doc-012-conclusao-obra",
      submittedAt: createTimestamp("2025-05-28T11:00:00Z") as any,
      formData: {
        dataConclusao: createTimestamp("2025-05-28T00:00:00Z"),
        ordemServico: "OS-2024-005",
        responsavel: "Carlos Souza",
        statusFinal: "Concluído",
        observacoesFinais: "Obra finalizada dentro do prazo. Cliente assinou termo de aceite.",
        pendencias: "Nenhuma",
      },
      photoUrls: [MOCK_PHOTOS[1], MOCK_PHOTOS[2]],
      submittedBy: "mg01",
      gerenteId: "mg01",
    },
  ],
};

// ==================== NOTIFICAÇÕES ====================

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-001",
    userId: "demo-user-001",
    title: "Novo relatório enviado",
    message: "Carlos Souza enviou o Diário de Obra para OS-2024-001.",
    type: "SUCCESS",
    link: "/dashboard/search?os=OS-2024-001",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: "notif-002",
    userId: "demo-user-001",
    title: "Etapa em atraso",
    message: "A etapa de Cobertura Metálica da OS-2024-002 está em atraso.",
    type: "WARNING",
    link: "/dashboard/search?os=OS-2024-002",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
  },
  {
    id: "notif-003",
    userId: "demo-user-001",
    title: "RNC emitido",
    message: "Relatório de Não Conformidade emitido para OS-2024-002 por Maria Oliveira.",
    type: "ERROR",
    link: "/dashboard/search?os=OS-2024-002",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: "notif-004",
    userId: "demo-user-001",
    title: "DDS registrado",
    message: "Diálogo de Segurança registrado com sucesso para OS-2024-002.",
    type: "INFO",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: "notif-005",
    userId: "demo-user-001",
    title: "Obra concluída",
    message: "OS-2024-005 foi finalizada com sucesso. Termo de aceite assinado.",
    type: "SUCCESS",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  },
];

// ==================== STATS DO DASHBOARD (MONITORAMENTO) ====================

export const MOCK_DASHBOARD_STATS = {
  counts: {
    totalForms: 42,
    pendingReviews: 5,
    totalUsers: 8,
  },
  charts: {
    formsByMonth: [
      { name: "Jan", value: 3 },
      { name: "Fev", value: 5 },
      { name: "Mar", value: 7 },
      { name: "Abr", value: 8 },
      { name: "Mai", value: 10 },
      { name: "Jun", value: 9 },
    ],
    formsByType: [
      { name: "Diário de Obra", value: 15 },
      { name: "Reunião Projeto", value: 6 },
      { name: "Inspeção Site", value: 8 },
      { name: "DDS", value: 7 },
      { name: "Checklist", value: 6 },
    ],
    formsByStatus: [
      { name: "Enviados", value: 30 },
      { name: "Em Revisão", value: 5 },
      { name: "Aprovados", value: 7 },
    ],
  },
};

// ==================== MOCK FORMS LIST (para export Excel) ====================

export const MOCK_FORMS_LIST = [
  { osNumber: "OS-2024-001", formType: "cronograma-diario-obra", userId: "mg01", submittedAt: "2025-06-10T14:30:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-001", formType: "doc-001-reuniao-projeto", userId: "mg01", submittedAt: "2025-05-15T10:00:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-001", formType: "relatorio-inspecao-site", userId: "mg03", submittedAt: "2025-06-08T16:00:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-002", formType: "cronograma-diario-obra", userId: "mg02", submittedAt: "2025-06-12T16:45:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-002", formType: "doc-009-dds", userId: "mg02", submittedAt: "2025-06-12T08:00:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-003", formType: "cronograma-diario-obra", userId: "mg01", submittedAt: "2025-06-08T09:15:00Z", status: "DRAFT" },
  { osNumber: "OS-2024-004", formType: "doc-002-checklist-pre-obra", userId: "mg02", submittedAt: "2025-06-01T08:00:00Z", status: "SUBMITTED" },
  { osNumber: "OS-2024-005", formType: "doc-012-conclusao-obra", userId: "mg01", submittedAt: "2025-05-28T11:00:00Z", status: "APPROVED" },
];

// ==================== IN-MEMORY STORE (para submit mock) ====================

let mockSubmissionCounter = 100;

export function addMockRelatorio(osNumber: string, data: any): { reportId: string; osId: string } {
  const reportId = `mock-report-${++mockSubmissionCounter}`;
  
  const newReport: ReportData = {
    id: reportId,
    formName: data.formName,
    formType: data.formType,
    submittedAt: createTimestamp(new Date().toISOString()) as any,
    formData: data.formData || {},
    photoUrls: [],
    submittedBy: data.submittedBy,
    gerenteId: data.gerenteId,
  };

  if (!MOCK_RELATORIOS[osNumber]) {
    MOCK_RELATORIOS[osNumber] = [];
  }
  MOCK_RELATORIOS[osNumber].unshift(newReport);

  return { reportId, osId: osNumber };
}
