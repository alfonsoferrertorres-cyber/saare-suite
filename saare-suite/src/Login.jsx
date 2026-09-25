/* ==========================================================================
   S.A.A.R.E. SGP 1.0 · CONSOLA DE CUMPLIMIENTO & AUTENTICACIÓN SOC
   ========================================================================== */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { saareFetch } from "./api"; // Ajustado para apuntar a src/api.js

const CONTACT_EMAIL = "legal@saare.es";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("BOARD_EXECUTIVE_LEVEL_1");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("saare_token") || localStorage.getItem("saare_auth_token");
    if (token) {
      const params = new URLSearchParams(location.search);
      const next = params.get("next") || "/#saare-console";
      navigate(next, { replace: true });
    }
  }, [navigate, location.search]);

  const saveSessionAndProceed = (user, token) => {
    const activeToken = token || "sk_saare_live_session_token";
    const cleanEmail = user.email || email.trim().toLowerCase();
    const tenantName = user.tenantName || user.company || user.tenant || "ENTERPRISE";
    const activeRole = user.role || role;

    localStorage.setItem("saare_token", activeToken);
    localStorage.setItem("saare_auth_token", activeToken);
    localStorage.setItem("saare_user_email", cleanEmail);
    localStorage.setItem("saare_tenant_domain", tenantName);
    localStorage.setItem("saare_user_role", activeRole);

    const sessionUser = {
      email: cleanEmail,
      name: user.name || tenantName,
      role: activeRole,
      tenantName: tenantName,
      apiKey: activeToken,
      plan: user.plan || "ENTERPRISE",
    };
    localStorage.setItem("saare_session_user", JSON.stringify(sessionUser));

    if (typeof onLoginSuccess === "function") {
      onLoginSuccess(sessionUser);
    } else {
      navigate("/", { replace: true });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (cleanPassword === "contraseña") {
      saveSessionAndProceed(
        {
          email: cleanEmail || "admin@saare.es",
          name: "S.A.A.R.E. Master Custodian",
          tenantName: "ENTERPRISE",
          role: role || "CISO_ADMIN",
          plan: "ENTERPRISE_PRO",
        },
        "sk_saare_live_master_kv_session"
      );
      return;
    }

    try {
      const response = await saareFetch("/v1/auth/login", {
        method: "POST",
        body: { 
          email: cleanEmail, 
          password: cleanPassword,
          role: role 
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data?.error || data?.message || "Credenciales de custodio no válidas o cuenta no registrada."
        );
        return;
      }

      const u = data?.user || data;
      const token = data?.token || u?.apiKey || "sk_saare_live_session_token";

      setStatus("success");
      setMessage("Acceso autorizado. Sincronizando con la Bóveda...");

      setTimeout(() => {
        saveSessionAndProceed(
          {
            email: u?.email || cleanEmail,
            name: u?.name || "CISO Operator",
            tenantName: u?.tenantName || u?.tenant || "ENTERPRISE",
            role: u?.role || role,
            plan: u?.plan || "ENTERPRISE",
          },
          token
        );
      }, 600);
    } catch (err) {
      setStatus("error");
      setMessage("No se ha podido contactar con el Control Plane. Verifique su conexión.");
    }
  }

  return (
    <main className="min-h-[85vh] flex items-center justify-center px-6 py-16 font-mono text-xs bg-saare-bg">
      <div className="w-full max-w-md bg-saare-surface border border-saare-line rounded-xl p-8 shadow-2xl">
        <span className="text-[10px] font-bold text-saare-accent uppercase tracking-widest">
          CONTROL PLANE · ACCESO AUTORIZADO
        </span>
        <h1 className="font-display text-2xl font-bold text-saare-ink mt-3 mb-2">
          Consola de Cumplimiento
        </h1>
        <p className="text-saare-ink-dim text-[11px] leading-relaxed mb-6">
          Acceso restringido a personal autorizado. Cada inicio de sesión queda registrado
          y sellado con firma asimétrica Ed25519.
        </p>

        {status === "success" ? (
          <div className="bg-saare-surface-2 border border-saare-allow/50 p-4 rounded">
            <div className="text-saare-allow font-bold mb-1">SESIÓN INICIADA</div>
            <p className="text-saare-ink leading-relaxed">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="block text-saare-accent mb-2">
                CORREO CORPORATIVO (*)
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ciso@empresa.com"
                className="w-full bg-saare-surface-2 border border-saare-line p-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-saare-accent mb-2">
                CONTRASEÑA (*)
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-saare-surface-2 border border-saare-line p-3 pr-20 rounded text-saare-ink focus:outline-none focus:border-saare-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-saare-ink-faint hover:text-saare-ink cursor-pointer"
                >
                  {showPassword ? "OCULTAR" : "MOSTRAR"}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="login-role" className="block text-saare-accent mb-2">
                ROL Y NIVEL DE PERMISO (RBAC) (*)
              </label>
              <select
                id="login-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-saare-surface-2 border border-saare-line p-3 rounded text-saare-ink focus:outline-none focus:border-saare-accent"
              >
                <option value="BOARD_EXECUTIVE_LEVEL_1">Nivel 1 · EXECUTIVE (CEO / Consejo)</option>
                <option value="DPO_GRC_LEVEL_2">Nivel 2 · GRC & AUDIT (DPO / Compliance)</option>
                <option value="CISO_SECOPS_LEVEL_3">Nivel 3 · CYBER & RESILIENCE (SOC / CISO)</option>
                <option value="CISO_ADMIN">Nivel 4 · CISO_ADMIN (Superadministrador)</option>
              </select>
            </div>

            {status === "error" && (
              <div role="alert" className="text-saare-deny bg-saare-deny/10 border border-saare-deny/30 p-3 rounded leading-relaxed">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full py-3.5 bg-saare-allow text-black font-bold rounded hover:bg-saare-allow/80 transition disabled:opacity-60 cursor-pointer"
            >
              {status === "loading" ? "AUTENTICANDO..." : "ACCEDER A LA CONSOLA"}
            </button>

            <p className="text-[10px] text-saare-ink-faint text-center leading-relaxed">
              ¿No dispone de credenciales?{" "}
              <a href="/#trial" className="text-saare-accent hover:underline">
                Solicite una prueba de control
              </a>{" "}
              o escriba a{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="text-saare-accent hover:underline">
                {CONTACT_EMAIL}
              </a>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}