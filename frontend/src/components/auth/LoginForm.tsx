"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Building, Globe } from "lucide-react";
import Logo from "@/components/icons/Logo";
import { DEMO_MODE } from "@/lib/mock-data";
import { useTranslation } from "@/context/language-context";

export function LoginForm() {
  const [idGerente, setIdGerente] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  // Firebase typically uses email for username. We'll construct an email from id_gerente.
  const constructEmail = (id: string) => `${id}@gmail.com`;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (!idGerente || !password) {
      toast({
        title: language === "pt" ? "Erro" : "Error",
        description: t("login_error_missing"),
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Demo mode: aceitar qualquer credencial
    if (DEMO_MODE) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      localStorage.setItem("demo_logged_in", "true");
      window.dispatchEvent(new Event("demo-auth-change"));
      toast({
        title: language === "pt" ? "Sucesso" : "Success",
        description: t("login_success"),
      });
      router.push("/dashboard");
      setLoading(false);
      return;
    }

    const email = constructEmail(idGerente);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: language === "pt" ? "Sucesso" : "Success",
        description: language === "pt" ? "Login realizado com sucesso!" : "Login successful!",
      });
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      let errorMessage = language === "pt" ? "Falha no login. Verifique suas credenciais." : "Login failed. Please check credentials.";
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = language === "pt" ? "ID Gerente ou Senha inválidos." : "Invalid Manager ID or Password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = language === "pt" ? "O formato do ID Gerente está incorreto." : "Manager ID format is incorrect.";
      }
      toast({
        title: language === "pt" ? "Falha no Login" : "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative">
      {/* Floating Language Switcher for Login */}
      <div className="absolute -top-12 right-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLanguage(language === "pt" ? "en" : "pt")}
          className="bg-slate-900/60 backdrop-blur-md text-white border-white/20 hover:bg-slate-800 hover:text-white rounded-xl gap-1.5 font-bold"
        >
          <Globe className="h-4 w-4" />
          <span>{language === "pt" ? "PT" : "EN"}</span>
        </Button>
      </div>

      <Card className="w-full shadow-xl relative overflow-hidden">
        {/* Dynamic decorative glass background inside card */}
        <div className="absolute -right-20 -bottom-20 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="items-center text-center">
          <Logo className="mb-4" />
          <CardTitle className="text-2xl">{t("login_title")}</CardTitle>
          <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
            {DEMO_MODE ? (
              <>
                🎓 <strong>{language === "pt" ? "Versão Demo — TCC" : "Demo Version — Project"}</strong><br /><br />
                {language === "pt" ? "Insira qualquer usuário e senha para acessar o painel." : "Enter any username and password to access the panel."}<br />
                <span className="text-primary font-medium">{language === "pt" ? "Dados simulados • Sem conexão real" : "Simulated data • No real backend"}</span>
              </>
            ) : (
              <>
                Insira suas credenciais para acessar o painel de formulários.<br></br>
                <br></br>Usuário padrão: mg01 | Senha: 123456 <br></br> Admin:
                renaniomes10 | Senha: 101010
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="id_gerente">{t("login_id_label")}</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="id_gerente"
                  type="text"
                  placeholder={DEMO_MODE ? t("login_id_placeholder") : "Ex: MG001"}
                  value={idGerente}
                  onChange={(e) => setIdGerente(e.target.value)}
                  required
                  className="pl-10 h-11 rounded-xl"
                  aria-label={t("login_id_label")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login_pass_label")}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10 h-11 rounded-xl"
                  aria-label={t("login_pass_label")}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={loading}>
              {loading ? (language === "pt" ? "Entrando..." : "Signing in...") : t("login_submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm text-muted-foreground flex flex-col gap-2">
          <p className="text-xs">
            {t("login_footer")}
          </p>
          {!DEMO_MODE && (
            <div className="w-full text-right">
              <a
                href="/login/forgot-password"
                className="text-sm text-primary underline"
              >
                Esqueci minha senha
              </a>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
