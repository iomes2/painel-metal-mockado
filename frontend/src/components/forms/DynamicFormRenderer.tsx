"use client";

import type {
  FormDefinition,
  FormField as FormFieldType,
  FormFieldOption,
  LinkedFormTriggerCondition,
  CarryOverParam,
} from "@/config/forms";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/context/language-context";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Info, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getFormIcon } from "@/components/icons/icon-resolver";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { auth, storage, db } from "@/lib/firebase"; // db importado
import { Timestamp } from "firebase/firestore";
import { uploadFiles, submitRelatorio } from "@/lib/api-client";
import { DynamicField } from "./DynamicField";
import { DEMO_MODE, MOCK_USER } from "@/lib/mock-data";

interface DynamicFormRendererProps {
  formDefinition: FormDefinition;
  initialValues?: Record<string, any>;
  onSubmit?: (payload: any) => Promise<void>;
}

// Helper to create schema for a single field
const createFieldSchema = (field: FormFieldType, lang: string = "pt"): z.ZodTypeAny => {
  const isEn = lang === "en";
  switch (field.type) {
    case "text":
    case "textarea":
      if (field.required) {
        return z.string().min(1, isEn ? `${field.label} is required.` : `${field.label} é obrigatório(a).`);
      }
      return z.string().optional().or(z.literal(""));

    case "email":
      const emailSchema = z
        .string()
        .email(isEn ? `Invalid email format for ${field.label}.` : `Formato de e-mail inválido para ${field.label}.`);
      if (field.required) {
        return emailSchema.min(1, isEn ? `${field.label} is required.` : `${field.label} é obrigatório(a).`);
      }
      return emailSchema.optional().or(z.literal(""));

    case "number":
      const numberSchema = z.coerce.number();
      if (field.required) {
        return numberSchema.min(
          0.00001,
          isEn
            ? `${field.label} is required and must be different from zero, if applicable.`
            : `${field.label} é obrigatório(a) e deve ser diferente de zero, se aplicável.`
        );
      }
      return numberSchema.optional().nullable();

    case "date":
      if (field.required) {
        return z.coerce.date({
          required_error: isEn ? `${field.label} is required.` : `${field.label} é obrigatório(a).`,
          invalid_type_error: isEn ? `Invalid date for ${field.label}.` : `Data inválida para ${field.label}.`,
        });
      }
      return z.preprocess(
        (val) => (val === "" ? undefined : val),
        z.coerce.date().optional().nullable()
      );

    case "checkbox":
      return z.boolean().default((field.defaultValue as boolean) || false);

    case "select":
      if (field.required) {
        return z
          .string()
          .min(1, isEn ? `Please select an option for ${field.label}.` : `Por favor, selecione uma opção para ${field.label}.`);
      }
      return z.string().optional().or(z.literal(""));

    case "file":
      return z.any().optional().nullable();

    default:
      return z.any();
  }
};

// Helper to build Zod schema from form definition
const buildZodSchema = (fields: FormFieldType[], lang: string = "pt") => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  fields.forEach((field) => {
    schemaShape[field.id] = createFieldSchema(field, lang);
  });
  return z.object(schemaShape);
};

export function DynamicFormRenderer({
  formDefinition,
  initialValues,
  onSubmit,
}: DynamicFormRendererProps) {
  const { toast } = useToast();
  const { t, language } = useTranslation();
  const localizedForm = useMemo(() => {
    return translateFormDefinition(formDefinition, language);
  }, [formDefinition, language]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [mainOriginatingFormId, setMainOriginatingFormId] = useState<
    string | null
  >(null);
  const [carryOverQueryParams, setCarryOverQueryParams] = useState<
    Record<string, string>
  >({});

  const formSchema = buildZodSchema(localizedForm.fields, language);
  type FormValues = z.infer<typeof formSchema>;

  const defaultValues = localizedForm.fields.reduce((acc, field) => {
    acc[field.id] =
      field.defaultValue !== undefined
        ? field.defaultValue
        : field.type === "checkbox"
        ? false
        : field.type === "number"
        ? null
        : field.type === "file"
        ? null
        : "";
    return acc;
  }, {} as Record<string, any>);

  // Helper to normalize values (especially dates/timestamps)
  const prepareInitialValues = (values: Record<string, any> | undefined) => {
    if (!values) return {};
    const normalized = { ...values };

    Object.keys(normalized).forEach((key) => {
      const val = normalized[key];
      // Check if it looks like a Firebase Timestamp (seconds/nanoseconds) or similar object
      if (val && typeof val === "object") {
        if ("seconds" in val && typeof val.seconds === "number") {
          normalized[key] = new Date(val.seconds * 1000);
        } else if ("_seconds" in val && typeof val._seconds === "number") {
          normalized[key] = new Date(val._seconds * 1000);
        } else if (typeof val.toDate === "function") {
          normalized[key] = val.toDate();
        }
      }
    });
    return normalized;
  };

  const combinedDefaultValues = {
    ...defaultValues,
    ...prepareInitialValues(initialValues),
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: combinedDefaultValues as any,
  });

  const { watch, setValue, reset, getValues, control } = form;

  useEffect(() => {
    if (initialValues) {
      const normalizedValues = prepareInitialValues(initialValues);
      reset({ ...defaultValues, ...normalizedValues } as any);
    }
  }, [initialValues, reset]);

  // Watch all fields to handle generic visibility and dependencies
  const watchedValues = watch();

  const stableSetValue = useCallback(setValue, []);
  const stableGetValues = useCallback(getValues, []);

  // Auto-fill manager/responsible fields
  useEffect(() => {
    const user = DEMO_MODE ? (MOCK_USER as any) : auth.currentUser;
    if (user?.displayName) {
      const managerFields = [
        "gerente",
        "gerenteObra",
        "responsavel",
        "engenheiroResponsavel",
      ];
      managerFields.forEach((fieldName) => {
        // Check if field exists in definition and has no current value
        const fieldExists = localizedForm.fields.some(
          (f) => f.id === fieldName
        );
        const currentValue = form.getValues(fieldName);

        if (fieldExists && !currentValue) {
          form.setValue(fieldName, user.displayName);
        }
      });
    }
  }, [localizedForm, form]);

  useEffect(() => {
    const osFromQuery = searchParams.get("os");
    const originatingIdFromQuery = searchParams.get("originatingFormId");

    const tempCarryOverParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (key !== "os" && key !== "originatingFormId") {
        tempCarryOverParams[key] = value;
      }
    });
    setCarryOverQueryParams(tempCarryOverParams);

    if (originatingIdFromQuery) {
      setMainOriginatingFormId(originatingIdFromQuery);
    }

    const formOsField = localizedForm.fields.find(
      (f) => f.id === "ordemServico"
    );
    if (formOsField && osFromQuery) {
      if (stableGetValues("ordemServico" as any) !== osFromQuery) {
        stableSetValue("ordemServico" as any, osFromQuery, {
          shouldValidate: true,
        });
      }
    }
  }, [
    localizedForm.id,
    localizedForm.fields,
    searchParams,
    stableSetValue,
    stableGetValues,
  ]);

  // Generic Side Effect: Clear values of hidden fields
  useEffect(() => {
    localizedForm.fields.forEach((field) => {
      const isVisible = shouldRenderFormItem(
        localizedForm,
        field,
        watchedValues
      );

      if (!isVisible) {
        clearHiddenFieldValue(field, stableGetValues, stableSetValue);
      }
    });

    // Also run legacy side effects if needed (though generic clearing likely covers most)
    // We can keep specific legacy logic if it does complex stuff beyond clearing,
    // but looking at the code, it was mostly clearing.
    // Except "motivoNaoCumprimento" which compared times.
    // The new "shouldRenderCronogramaItem" handles visibility, and this effect clears it.
    // So distinct side-effect function is likely redundant for clearing.
  }, [localizedForm, watchedValues, stableGetValues, stableSetValue]);

  const handleLocalSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    const currentUser = DEMO_MODE ? (MOCK_USER as any) : auth.currentUser;

    if (!currentUser) {
      toast({
        title: language === "pt" ? "Erro de Autenticação" : "Authentication Error",
        description: language === "pt" ? "Você precisa estar logado para enviar formulários." : "You must be logged in to submit forms.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const submissionTimestamp = Date.now();
    const osValue = (data as Record<string, any>).ordemServico as
      | string
      | undefined;

    try {
      // 1. Upload de arquivos via API
      const finalFormDataToSave = await processFileUploads(
        data,
        localizedForm,
        currentUser,
        osValue,
        submissionTimestamp,
        toast
      );

      // 2. Converter Dates para Timestamps
      const formDataWithTimestamps = convertDatesToTimestamps(
        finalFormDataToSave,
        localizedForm
      );

      // 3. Submeter relatório via API
      const payload = {
        formType: localizedForm.id,
        formName: localizedForm.name,
        formData: formDataWithTimestamps,
        submittedBy: currentUser.uid,
        submittedAt: submissionTimestamp,
        gerenteId: currentUser.email?.split("@")[0] || "desconhecido",
        ...(mainOriginatingFormId &&
          localizedForm.id !== "cronograma-diario-obra" && {
            originatingFormId: mainOriginatingFormId,
          }),
        ...(osValue && { osNumber: osValue.trim() }),
      };

      // Se onSubmit personalizado foi fornecido, o componente pai (edit) lida com isso
      if (onSubmit) {
        await onSubmit(payload);
        toast({
          title: language === "pt" ? "Sucesso!" : "Success!",
          description: language === "pt"
            ? `Formulário "${localizedForm.name}" atualizado com sucesso!`
            : `Form "${localizedForm.name}" updated successfully!`,
        });
        reset(defaultValues);
        setIsShareDialogOpen(true);
        setIsSubmitting(false);
        return;
      }

      const result = await submitRelatorio(payload);

      if (result.reportId) {
        setSubmittedReportId(result.reportId);
      }

      toast({
        title: language === "pt" ? "Sucesso!" : "Success!",
        description: osValue
          ? (language === "pt"
              ? `Formulário "${localizedForm.name}" para OS "${osValue.trim()}" salvo com arquivos enviados!`
              : `Form "${localizedForm.name}" for Work Order "${osValue.trim()}" saved and files uploaded!`)
          : (language === "pt"
              ? `Formulário "${localizedForm.name}" salvo com sucesso e arquivos enviados!`
              : `Form "${localizedForm.name}" saved successfully and files uploaded!`),
      });

      const currentFormIsMainOriginator =
        localizedForm.id === "cronograma-diario-obra";
      const nextMainOriginatingFormId = currentFormIsMainOriginator
        ? result.reportId
        : mainOriginatingFormId;

      reset(defaultValues); // Reset form fields for current form

      const handled = handleLinkedFormTriggers(
        localizedForm,
        data,
        result,
        carryOverQueryParams,
        osValue,
        mainOriginatingFormId,
        nextMainOriginatingFormId,
        router,
        setIsShareDialogOpen,
        toast
      );
      if (handled) return;
    } catch (error) {
      console.error(
        "Erro durante o envio do formulário ou upload de arquivos:",
        error
      );
      toast({
        title: language === "pt" ? "Erro ao Salvar" : "Error Saving",
        description: language === "pt"
          ? "Não foi possível salvar o formulário ou enviar os arquivos. Tente novamente."
          : "Could not save form or upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const IconComponent = getFormIcon(localizedForm.iconName);

  const [submittedReportId, setSubmittedReportId] = useState<string | null>(
    null
  );

  const handleDownloadPdf = async () => {
    if (!submittedReportId) return;

    try {
      toast({
        title: language === "pt" ? "Gerando PDF..." : "Generating PDF...",
        description: language === "pt" ? "O download iniciará em instantes." : "The download will start in a moment.",
      });

      const { downloadFormPdf } = await import("@/lib/api-client");
      const blob = await downloadFormPdf(submittedReportId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `relatorio-${localizedForm.id}-${submittedReportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: language === "pt" ? "PDF baixado" : "PDF Downloaded",
        description: language === "pt" ? "O arquivo foi salvo no seu dispositivo." : "The file has been saved to your device.",
      });

      // Fechar modal e redirecionar após download
      handleShareDialogCancel();
    } catch (err: any) {
      console.error("Erro ao baixar PDF:", err);
      toast({
        title: language === "pt" ? "Erro ao baixar PDF" : "Error downloading PDF",
        description: err.message || (language === "pt" ? "Falha ao gerar o arquivo." : "Failed to generate the file."),
        variant: "destructive",
      });
    }
  };

  const handleShareDialogAction = () => {
    handleDownloadPdf();
  };

  const handleShareDialogCancel = () => {
    setIsShareDialogOpen(false);
    setMainOriginatingFormId(null);
    setCarryOverQueryParams({});
    setSubmittedReportId(null);
    router.push("/dashboard");
  };

  return (
    <>
      <Card className="w-full shadow-xl overflow-hidden">
        <CardHeader className="overflow-hidden pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <CardTitle className="text-lg sm:text-2xl leading-tight break-words">
                {localizedForm.name}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex-shrink-0 -mt-1"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              {language === "pt" ? "Voltar" : "Back"}
            </Button>
          </div>
          <CardDescription className="mt-1">
            {localizedForm.description}
          </CardDescription>
          {mainOriginatingFormId && (
            <div className="mt-2 p-2 bg-accent/10 border border-accent/30 rounded-md text-sm text-accent-foreground/80 flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>
                {language === "pt"
                  ? `Este formulário faz parte de uma sequência iniciada pelo Relatório ID: ${mainOriginatingFormId}.`
                  : `This form is part of a sequence initiated by Report ID: ${mainOriginatingFormId}.`}
              </span>
            </div>
          )}
          {Object.keys(carryOverQueryParams).length > 0 && (
            <div className="mt-1 p-2 bg-muted/50 border border-border rounded-md text-xs text-muted-foreground">
              <p className="font-medium mb-1">
                {language === "pt" ? "Dados recebidos do formulário anterior:" : "Data received from the previous form:"}
              </p>
              <ul className="list-disc list-inside pl-2">
                {Object.entries(carryOverQueryParams).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key}:</strong> {String(value)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLocalSubmit)}>
            <CardContent className="space-y-6">
              {localizedForm.fields.map((field) => {
                const shouldRenderField = shouldRenderFormItem(
                  localizedForm,
                  field,
                  watchedValues
                );

                if (!shouldRenderField) return null;

                // Determine if this field is conditionally rendered
                const isConditional = !!field.visibilityCondition;

                return (
                  <div
                    key={field.id}
                    className={cn(isConditional && "animate-slideDown")}
                  >
                    <DynamicField
                      field={field}
                      control={control}
                      isSubmitting={isSubmitting}
                    />
                  </div>
                );
              })}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? (language === "pt" ? "Enviando..." : "Submitting...")
                  : (language === "pt" ? "Enviar Formulário" : "Submit Form")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <AlertDialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "pt" ? "Formulário Enviado com Sucesso!" : "Form Submitted Successfully!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "pt"
                ? `Seu formulário "${localizedForm.name}" foi salvo. Deseja baixar o PDF gerado agora?`
                : `Your form "${localizedForm.name}" has been saved. Would you like to download the generated PDF now?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleShareDialogCancel}>
              {language === "pt" ? "Não, Voltar ao Início" : "No, Back to Dashboard"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleShareDialogAction}>
              {language === "pt" ? "Sim, Baixar PDF" : "Yes, Download PDF"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ================= Helpers for Logic Extraction =================

async function processFileUploads(
  data: any,
  formDefinition: FormDefinition,
  currentUser: any,
  osValue: string | undefined,
  submissionTimestamp: number,
  toast: any
) {
  const finalFormDataToSave = { ...data } as Record<string, any>;

  // Detect current language from window / default to pt
  const isEn = typeof window !== "undefined" && window.localStorage.getItem("app_lang") === "en";

  for (const field of formDefinition.fields) {
    if (field.type === "file" && data[field.id] instanceof FileList) {
      const fileList = data[field.id] as FileList;

      if (fileList.length > 0) {
        toast({
          title: isEn ? "Uploading files..." : "Enviando arquivos...",
          description: isEn
            ? `Please wait. ${fileList.length} file(s) being processed.`
            : `Por favor, aguarde. ${fileList.length} arquivo(s) sendo processado(s).`,
        });

        const uploadedPhotos = await uploadFiles(
          fileList,
          currentUser.uid,
          formDefinition.id,
          osValue || "general",
          submissionTimestamp
        );

        finalFormDataToSave[field.id] = uploadedPhotos;
      } else {
        delete finalFormDataToSave[field.id];
      }
    } else if (field.type === "file") {
      delete finalFormDataToSave[field.id];
    }
  }
  return finalFormDataToSave;
}

function convertDatesToTimestamps(
  data: Record<string, any>,
  formDefinition: FormDefinition
) {
  const formDataWithTimestamps = { ...data };
  formDefinition.fields.forEach((field) => {
    if (
      field.type === "date" &&
      formDataWithTimestamps[field.id] instanceof Date
    ) {
      formDataWithTimestamps[field.id] = Timestamp.fromDate(
        formDataWithTimestamps[field.id] as Date
      );
    }
  });
  return formDataWithTimestamps;
}

// ================= Trigger Logic =================

function checkTriggerCondition(
  trigger: LinkedFormTriggerCondition,
  formDefinition: FormDefinition,
  data: any,
  carryOverQueryParams: any
) {
  if (
    formDefinition.id === "relatorio-inspecao-site" &&
    trigger.linkedFormId === "rnc-report"
  ) {
    const rncTriggerFromAcompanhamento =
      carryOverQueryParams["rncTriggerValueFromAcompanhamento"];
    const currentConformidade = data["conformidadeSeguranca"];
    return (
      currentConformidade === "nao" && rncTriggerFromAcompanhamento === "sim"
    );
  }

  if (trigger.triggerFieldId.startsWith("_queryParam_")) {
    const paramName = trigger.triggerFieldId.substring("_queryParam_".length);
    return carryOverQueryParams[paramName] === trigger.triggerFieldValue;
  }

  return data[trigger.triggerFieldId] === trigger.triggerFieldValue;
}

function handleLinkedFormTriggers(
  formDefinition: FormDefinition,
  data: any,
  result: any,
  carryOverQueryParams: any,
  osValue: string | undefined,
  mainOriginatingFormId: string | null,
  nextMainOriginatingFormId: string | null,
  router: any,
  setIsShareDialogOpen: (v: boolean) => void,
  toast: any
) {
  const triggers = formDefinition.linkedFormTriggers;
  if (!triggers || !result.reportId) {
    setIsShareDialogOpen(true);
    return false;
  }

  for (const trigger of triggers) {
    if (
      checkTriggerCondition(trigger, formDefinition, data, carryOverQueryParams)
    ) {
      const nextQueryParams = new URLSearchParams();
      const osToPass =
        trigger.passOsFieldId && data[trigger.passOsFieldId]
          ? String(data[trigger.passOsFieldId]).trim()
          : osValue?.trim();

      if (osToPass) nextQueryParams.append("os", osToPass);
      if (nextMainOriginatingFormId) {
        nextQueryParams.append("originatingFormId", nextMainOriginatingFormId);
      }

      trigger.carryOverParams?.forEach((cop) => {
        if (data[cop.fieldIdFromCurrentForm] !== undefined) {
          nextQueryParams.append(
            cop.queryParamName,
            String(data[cop.fieldIdFromCurrentForm])
          );
        }
      });

      toast({
        title: "Próximo Passo",
        description: `Por favor, preencha o formulário: ${trigger.linkedFormId}.`,
        duration: 4000,
      });

      router.push(
        `/dashboard/forms/${trigger.linkedFormId}?${nextQueryParams.toString()}`
      );
      return true;
    }
  }

  setIsShareDialogOpen(true);
  return false;
}

// ================= Visibility & Side Effects Logic =================

function runFieldVisibilitySideEffects({
  formDefinition,
  stableGetValues,
  stableSetValue,
  watchedValues,
}: {
  formDefinition: FormDefinition;
  stableGetValues: any;
  stableSetValue: any;
  watchedValues: any;
}) {
  if (formDefinition.id === "cronograma-diario-obra") {
    handleCronogramaSideEffects(watchedValues, stableGetValues, stableSetValue);
  } else if (formDefinition.id === "rnc-report") {
    handleRncSideEffects(watchedValues, stableGetValues, stableSetValue);
  } else if (formDefinition.id === "relatorio-inspecao-site") {
    handleInspecaoSideEffects(watchedValues, stableGetValues, stableSetValue);
  }
}

function handleCronogramaSideEffects(
  watchedValues: any,
  stableGetValues: any,
  stableSetValue: any
) {
  const {
    situacaoEtapaDia,
    fotosEtapaDia,
    horasRetrabalhoParadasDia,
    horarioEfetivoInicioAtividades,
    horarioInicioJornadaPrevisto,
    horarioEfetivoSaidaObra,
    horarioTerminoJornadaPrevisto,
  } = watchedValues;

  if (
    situacaoEtapaDia !== "em_atraso" &&
    stableGetValues("motivoAtrasoDia") !== ""
  ) {
    stableSetValue("motivoAtrasoDia", "", { shouldValidate: false });
  }
  if (
    fotosEtapaDia !== "sim" &&
    stableGetValues("uploadFotosEtapaDia") !== null
  ) {
    stableSetValue("uploadFotosEtapaDia", null, { shouldValidate: false });
  }
  if (
    (!horasRetrabalhoParadasDia ||
      String(horasRetrabalhoParadasDia).trim() === "") &&
    stableGetValues("motivoRetrabalhoParadaDia") !== ""
  ) {
    stableSetValue("motivoRetrabalhoParadaDia", "", { shouldValidate: false });
  }

  const checkHorario = (efetivo: any, previsto: any, fieldName: string) => {
    const e = String(efetivo || "").trim();
    const p = String(previsto || "").trim();
    if ((e === "" || e === p) && stableGetValues(fieldName) !== "") {
      stableSetValue(fieldName, "", { shouldValidate: false });
    }
  };

  checkHorario(
    horarioEfetivoInicioAtividades,
    horarioInicioJornadaPrevisto,
    "motivoNaoCumprimentoHorarioInicio"
  );
  checkHorario(
    horarioEfetivoSaidaObra,
    horarioTerminoJornadaPrevisto,
    "motivoNaoCumprimentoHorarioSaida"
  );
}

function handleRncSideEffects(
  watchedValues: any,
  stableGetValues: any,
  stableSetValue: any
) {
  if (
    watchedValues.fotosNaoConformidade !== "sim" &&
    stableGetValues("uploadFotosNaoConformidade") !== null
  ) {
    stableSetValue("uploadFotosNaoConformidade", null, {
      shouldValidate: false,
    });
  }
}

function handleInspecaoSideEffects(
  watchedValues: any,
  stableGetValues: any,
  stableSetValue: any
) {
  if (
    watchedValues.fotosInspecao !== "sim" &&
    stableGetValues("uploadFotosInspecao") !== null
  ) {
    stableSetValue("uploadFotosInspecao", null, { shouldValidate: false });
  }
  if (
    watchedValues.conformidadeSeguranca === "sim" &&
    (stableGetValues("itensNaoConformes") !== "" ||
      stableGetValues("acoesCorretivasSugeridas") !== "")
  ) {
    stableSetValue("itensNaoConformes", "", { shouldValidate: false });
    stableSetValue("acoesCorretivasSugeridas", "", { shouldValidate: false });
  }
}

function clearHiddenFieldValue(
  field: FormFieldType,
  stableGetValues: any,
  stableSetValue: any
) {
  const currentValue = stableGetValues(field.id as any);
  const emptyValue =
    field.type === "checkbox"
      ? false
      : field.type === "number"
      ? null
      : field.type === "file"
      ? null
      : "";

  // Only reset if it currently has a non-empty value (to avoid loops/redundant updates)
  // Note: we consider "false" as empty for checkbox, so strictly check
  if (
    currentValue !== emptyValue &&
    currentValue !== undefined &&
    currentValue !== null
  ) {
    // For strings, check if ""
    if (typeof currentValue === "string" && currentValue === "") return;

    stableSetValue(field.id as any, emptyValue, {
      shouldValidate: false,
    });
  }
}

function checkGenericVisibility(
  field: FormFieldType,
  watchedValues: any
): boolean {
  if (!field.visibilityCondition) return true;

  const { fieldId, conditionValue, operator } = field.visibilityCondition;
  const dependentValue = watchedValues[fieldId];

  const checkEquality = (val1: any, val2: any) => String(val1) === String(val2);
  const valuesToCheck = Array.isArray(conditionValue)
    ? conditionValue
    : [conditionValue];

  if (operator === "neq") {
    return !valuesToCheck.some((v) => checkEquality(dependentValue, v));
  }

  if (operator === "in") {
    return valuesToCheck.some((v) => checkEquality(dependentValue, v));
  }

  if (operator === "contains") {
    return String(dependentValue || "").includes(String(conditionValue));
  }

  // Default 'eq'
  return valuesToCheck.some((v) => checkEquality(dependentValue, v));
}

function shouldRenderFormItem(
  formDefinition: FormDefinition,
  field: FormFieldType,
  watchedValues: any
): boolean {
  // 1. Generic Visibility Condition
  if (field.visibilityCondition) {
    const isVisible = checkGenericVisibility(field, watchedValues);
    if (!isVisible) return false;
  }

  // 2. Existing Hardcoded Logic (Legacy support until fully migrated)
  if (formDefinition.id === "cronograma-diario-obra") {
    return shouldRenderCronogramaItem(field, watchedValues);
  } else if (formDefinition.id === "rnc-report") {
    // Migrated logic can remain or be removed if config is updated
    if (field.id === "uploadFotosNaoConformidade" && !field.visibilityCondition)
      return watchedValues.fotosNaoConformidade === "sim";
  } else if (formDefinition.id === "relatorio-inspecao-site") {
    // Keep checking existing logic if no generic condition is present
    if (!field.visibilityCondition) {
      return shouldRenderInspecaoItem(field, watchedValues);
    }
  }

  return true;
}

// Helper for comparing times
function isTimeMismatch(effective: any, expected: any): boolean {
  const e = String(effective || "").trim();
  const p = String(expected || "").trim();
  return e !== "" && e !== p;
}

function shouldRenderCronogramaItem(
  field: FormFieldType,
  watchedValues: any
): boolean {
  // If the field has a generic condition, skip hardcoded logic to avoid conflict/double hiding
  if (field.visibilityCondition) return true;

  const {
    situacaoEtapaDia,
    fotosEtapaDia,
    horasRetrabalhoParadasDia,
    horarioEfetivoInicioAtividades,
    horarioInicioJornadaPrevisto,
    horarioEfetivoSaidaObra,
    horarioTerminoJornadaPrevisto,
    situacaoEtapa, // From DOC-020
    fotosEtapa,
    motivoAtraso,
    horasRetrabalho,
    horarioEfetivoInicio,
    horarioEfetivoSaida,
    horarioInicioJornada,
    horarioTerminoJornada, // Fixed missing destructuring
  } = watchedValues;

  // Existing DOC-020 Logic
  if (field.id === "motivoAtraso") return situacaoEtapa === "em_atraso";
  if (field.id === "uploadFotos") return fotosEtapa === "S";
  if (field.id === "motivoRetrabalho")
    return !!horasRetrabalho && String(horasRetrabalho).trim() !== "";

  if (field.id === "motivoNaoCumprimentoInicio") {
    return isTimeMismatch(
      horarioEfetivoInicio,
      horarioInicioJornada || "07:30"
    );
  }
  if (field.id === "motivoNaoCumprimentoSaida") {
    return isTimeMismatch(
      horarioEfetivoSaida,
      horarioTerminoJornada || "17:30"
    );
  }

  // Legacy (Older cronograma ID fields)
  if (field.id === "motivoAtrasoDia") return situacaoEtapaDia === "em_atraso";
  if (field.id === "uploadFotosEtapaDia") return fotosEtapaDia === "sim";
  if (field.id === "motivoRetrabalhoParadaDia")
    return (
      !!horasRetrabalhoParadasDia &&
      String(horasRetrabalhoParadasDia).trim() !== ""
    );
  if (field.id === "motivoNaoCumprimentoHorarioInicio") {
    return isTimeMismatch(
      horarioEfetivoInicioAtividades,
      horarioInicioJornadaPrevisto
    );
  }
  if (field.id === "motivoNaoCumprimentoHorarioSaida") {
    return isTimeMismatch(
      horarioEfetivoSaidaObra,
      horarioTerminoJornadaPrevisto
    );
  }
  return true;
}

function shouldRenderInspecaoItem(
  field: FormFieldType,
  watchedValues: any
): boolean {
  if (field.id === "uploadFotosInspecao")
    return watchedValues.fotosInspecao === "sim";
  if (
    field.id === "itensNaoConformes" ||
    field.id === "acoesCorretivasSugeridas"
  ) {
    return watchedValues.conformidadeSeguranca === "nao";
  }
  return true;
}

export const translateFormDefinition = (form: FormDefinition, lang: string): FormDefinition => {
  if (lang !== "en") return form;

  const translatedFields = form.fields.map((field) => {
    let label = field.label;
    let placeholder = field.placeholder;
    let options = field.options;

    // Common labels translation
    const labelTranslations: Record<string, string> = {
      "Data Inicial": "Start Date",
      "Data Final Projetada": "Projected End Date",
      "OS": "Work Order (OS)",
      "ETAPA (Descrição)": "STAGE (Description)",
      "Data Projetada para a Etapa": "Projected Stage Date",
      "Data Atual": "Current Date",
      "Encarregado / Líder da Equipe": "Supervisor / Team Leader",
      "Assinatura do Encarregado": "Supervisor Signature",
      "Situação da Etapa no Dia": "Daily Stage Status",
      "Fotos da Etapa no Dia": "Daily Stage Photos",
      "Horas de Retrabalho / Paradas no Dia": "Daily Rework / Downtime Hours",
      "Horário Efetivo de Início das Atividades": "Actual Work Start Time",
      "Horário de Início de Jornada Previsto": "Scheduled Start Time",
      "Horário Efetivo de Saída da Obra": "Actual Leave Time",
      "Horário de Término de Jornada Previsto": "Scheduled End Time",
      "Motivo do Atraso": "Reason for Delay",
      "Fotos Enviadas": "Photos Uploaded",
      "Fotos não enviadas": "Photos not uploaded",
      "Motivo do Retrabalho / Parada": "Reason for Rework / Downtime",
      "Motivo do Não Cumprimento do Horário de Início": "Reason for Start Time Delay",
      "Motivo do Não Cumprimento do Horário de Saída": "Reason for Leave Time Mismatch",
      "Gerente Responsável": "Responsible Manager",
      "Status da Revisão": "Review Status",
      "Descrição da Não Conformidade": "Description of Non-Conformance",
      "Ações Corretivas Propostas": "Proposed Corrective Actions",
      "Fotos da Não Conformidade": "Non-Conformance Photos",
      "Enviar Fotos da Não Conformidade": "Upload Non-Conformance Photos",
      "Conformidade com Normas de Segurança": "Safety Compliance Status",
      "Itens Não Conformes Observados": "Non-Conformance Items Observed",
      "Ações Corretivas Sugeridas": "Suggested Corrective Actions",
      "Fotos da Inspeção": "Inspection Photos",
      "Enviar Fotos da Inspeção": "Upload Inspection Photos",
    };

    if (labelTranslations[label]) {
      label = labelTranslations[label];
    } else if (label.startsWith("---") && label.endsWith("---")) {
      label = label.replace("RELATÓRIO DE DESENVOLVIMENTO", "DAILY PROGRESS REPORT")
                   .replace("DADOS DO DIA", "DAILY DATA");
    }

    const placeholderTranslations: Record<string, string> = {
      "Nome/Descrição da etapa": "Name/Description of the stage",
      "Selecione...": "Select...",
      "Escolha uma data": "Pick a date",
      "Digite aqui...": "Type here...",
    };

    if (placeholder && placeholderTranslations[placeholder]) {
      placeholder = placeholderTranslations[placeholder];
    }

    // Common option translations
    if (options) {
      options = options.map((opt) => {
        let optLabel = opt.label;
        const optTranslations: Record<string, string> = {
          "Em dia": "On Track",
          "Adiantado": "Ahead",
          "Em atraso": "Delayed",
          "Sim": "Yes",
          "Não": "No",
          "S": "Yes",
          "N": "No",
          "Falta de Mão de Obra": "Labor Shortage",
          "Problema com Equipamentos": "Equipment Issues",
          "Clima / Chuva": "Weather / Rain",
          "Atraso no fornecimento de material": "Material Supply Delay",
          "Aguardando liberação do cliente": "Awaiting Client Approval",
          "Outros (descrever no Diário)": "Others (describe in Daily Log)",
          "Aprovado": "Approved",
          "Pendente": "Pending",
          "Reprovado": "Rejected",
          "Aprovado com Ressalvas": "Approved with Reservations",
        };
        if (optTranslations[optLabel]) {
          optLabel = optTranslations[optLabel];
        }
        return { ...opt, label: optLabel };
      });
    }

    return { ...field, label, placeholder, options };
  });

  // Translate form name and description
  let name = form.name;
  let description = form.description;
  const nameTranslations: Record<string, string> = {
    "DOC-020: Acompanhamento de Cronograma e Diário de Obra": "DOC-020: Daily Work Progress Log",
    "DOC-010: Relatório de Não-Conformidade - RNC": "DOC-010: Non-Conformance Report (NCR)",
    "DOC-005: Relatório de Inspeção de Obra": "DOC-005: Site Inspection Report",
  };
  const descTranslations: Record<string, string> = {
    "Registro diário de desenvolvimento da etapa, mão de obra, horários e ocorrências.": "Daily progress report, manpower planning, work schedules and incident log.",
    "Registro de não conformidades, desvios e ações corretivas/preventivas propostas.": "Recording of non-conformities, deviations and proposed corrective/preventive actions.",
    "Inspeção de içamento, estrutura montada, telhas e liberação final do canteiro.": "Inspection of rigging operations, assembled structure, roofing safety, and site sign-off.",
  };

  if (nameTranslations[name]) name = nameTranslations[name];
  if (descTranslations[description]) description = descTranslations[description];

  return { ...form, name, description, fields: translatedFields };
};
