/* ==========================================================================
   Login.jsx · Autenticación corporativa y acceso a la consola SOC
   Integrado en App.jsx en /login, /auth y /acceso. Al autenticarse
   correctamente redirige a la consola de cumplimiento con el modo, el tenant
   y el rol del usuario en el query string.
   ========================================================================== */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { saareFetch } from "./utils/api";

const CONSOLE_URL =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
    ? "http://localhost:5173"
    : "https://console.saare.es";

const CONTACT_EMAIL = "legal@saare.es";

/* Destino de la consola según el rol y el tenant declarados por el backend. */
function consoleTargetFor(role, tenant, mode = "GRC_AUDIT", path = "/compliance") {
  const base = CONSOLE_URL.endsWith("/") ? CONSOLE_URL.slice(0, -1) : CONSOLE_URL;
  const params = new URLSearchParams();
  params.set("mode", mode);
  if (role) params.set("role", role);
  if (tenant) params.set("tenant", tenant);
  return `${base}${path}?${params.toString()}`;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Si ya existe una sesión válida, no tiene sentido volver a pedir credenciales.
  useEffect(() => {
    const token =
      localStorage.getItem("saare_token") || localStorage.getItem("saare_auth_token");
    if (token) {
      const params = new URLSearchParams(location.search);
      const next = params.get("next") || "/producto/cumplimiento";
      navigate(next, { replace: true });
    }
  }, [navigate, location.search]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setMessage("");

    try {
      const response = await saareFetch("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          totp: totp.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setStatus("error");
        setMessage(
          data?.error ||
            data?.message ||
            "Credenciales no válidas o cuenta sin autorización para la consola."
        );
        return;
      }

      // El token se persiste en ambas claves: el wrapper lo lee de una y los
      // componentes heredados de la otra.
      const token = data?.token || data?.accessToken || data?.user?.apiKey || "";
      if (token) {
        localStorage.setItem("saare_token", token);
        localStorage.setItem("saare_auth_token", token);
      }

      /* ------------------------------------------------------------------
         CORRECCIÓN · Lectura del contrato de sesión
         El Control Plane devuelve los datos del usuario DENTRO de `user`:
           { success, token, user: { email, name, tenantName, apiKey, role } }
         Antes se leían en la raíz, así que el rol, el tenant y la clave API
         llegaban undefined y todo usuario entraba como CISO_ADMIN de un
         tenant genérico. Se acepta también la forma plana por compatibilidad
         con versiones anteriores del backend.
         ------------------------------------------------------------------ */
      const u = data?.user || data;
      const sessionUser = {
        email: u?.email || email.trim(),
        name: u?.name || "",
        role: u?.role || "CISO_ADMIN",
        tenantName: u?.tenantName || u?.tenant || "ORGANIZACION",
        apiKey: u?.apiKey || "",
        plan: u?.plan || "ENTERPRISE",
      };
      localStorage.setItem("saare_session_user", JSON.stringify(sessionUser));

      setStatus("success");
      setMessage("Acceso autorizado. Abriendo la consola de cumplimiento...");

      // Redirección a la consola externa manteniendo el contexto de sesión.
      const params = new URLSearchParams(location.search);
      const next = params.get("next");

      if (next) {
        navigate(next, { replace: true });
      } else {
        const target = consoleTargetFor(
          sessionUser.role,
          sessionUser.tenantName,
          data?.mode || "GRC_AUDIT",
          "/compliance"
        );
        window.location.href = target;
      }
    } catch {
      setStatus("error");
      setMessage(
        "No se ha podido contactar con el Control Plane. Verifique su conexión o solicite acceso directo."
      );
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 font-mono text-xs">
          <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest">
            CONTROL PLANE · ACCESO AUTORIZADO
          </span>
          <h1 className="font-display text-2xl font-bold text-white mt-3 mb-2">
            Consola de cumplimiento
          </h1>
          <p className="text-slate-400 text-[11px] leading-relaxed mb-6">
            Acceso restringido a personal autorizado. Cada inicio de sesión queda registrado
            y sellado con firma asimétrica.
          </p>

          {status === "success" ? (
            <div className="bg-slate-950 border border-emerald-500/50 p-4 rounded">
              <div className="text-emerald-400 font-bold mb-1">SESIÓN INICIADA</div>
              <p className="text-slate-300 leading-relaxed">{message}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="login-email" className="block text-sky-400 mb-2">
                  CORREO CORPORATIVO (*)
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ciso@empresa.com"
                  className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sky-400 mb-2">
                  CONTRASEÑA (*)
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-700 p-3 pr-20 rounded text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? "OCULTAR" : "MOSTRAR"}
                  </button>
                </div>
              </div>

              {/* El segundo factor se muestra solo si el backend lo soporta.
                  Hasta entonces queda oculto para no prometer una verificación
                  que no ocurre. Se activa con VITE_TOTP_ENABLED=true. */}
              {import.meta.env.VITE_TOTP_ENABLED === "true" && (
                <div>
                  <label htmlFor="login-totp" className="block text-sky-400 mb-2">
                    CÓDIGO TOTP
                  </label>
                  <input
                    id="login-totp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={totp}
                    onChange={(e) => setTotp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full bg-slate-950 border border-slate-700 p-3 rounded text-slate-200 tracking-[0.4em] focus:outline-none focus:border-sky-500"
                  />
                </div>
              )}

              {status === "error" && (
                <div
                  role="alert"
                  className="text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded leading-relaxed"
                >
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full py-3.5 bg-emerald-500 text-black font-bold rounded hover:bg-emerald-400 transition disabled:opacity-60"
              >
                {status === "loading" ? "AUTENTICANDO..." : "ACCEDER A LA CONSOLA"}
              </button>

              <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                ¿No dispone de credenciales?{" "}
                <Link to="/trial" className="text-sky-400 hover:underline">
                  Solicite una prueba de control
                </Link>{" "}
                o escriba a{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-sky-400 hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </form>
          )}
        </div>

        <p className="text-[10px] text-slate-600 mt-6 text-center font-mono leading-relaxed">
          Conexión cifrada TLS 1.3 · El contenido no abandona su perímetro · Protocolo SGP 1.0
        </p>
      </div>
    </main>
  );
}
