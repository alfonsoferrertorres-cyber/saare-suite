// saare-suite/src/components/PricingSection.jsx
import React, { useState } from 'react';
import { API_HOST } from '../api/api';

const B2B_PLANS = [
  {
    id: 'SANDBOX_FREE',
    name: 'Acceso Inicial',
    price: '0',
    period: ' / gratis',
    description: 'Entorno inicial sin tarjeta de crédito para evaluación técnica y operativa.',
    badge: 'GRATIS · SIN TARJETA',
    isSandbox: true,
    features: [
      '2 asientos incluidos',
      'Acceso a los módulos de gobernanza y control de flujo',
      'Hasta 1.000 evaluaciones preventivas al mes',
      'Registro aislado de evidencias y credencial API',
      'Configuración de políticas y despliegue de agente'
    ],
    ctaText: 'Activar Acceso (2 Asientos)',
    stripePaymentLink: ''
  },
  {
    id: 'STARTER_199',
    name: 'Equipo',
    price: '199',
    period: '/mes',
    description: 'Control preventivo esencial para equipos que operan sistemas de IA.',
    badge: null,
    features: [
      'Hasta 10 asientos operativos',
      'Control en origen para navegadores compatibles',
      'Detección y tratamiento de datos sensibles en memoria',
      'Hasta 10.000 evaluaciones preventivas al mes',
      'Registro de evidencias aislado por organización'
    ],
    ctaText: 'Contratar Plan Equipo',
    stripePaymentLink: import.meta.env.VITE_STRIPE_LINK_STARTER || ''
  },
  {
    id: 'PROFESSIONAL_649',
    name: 'Corporate',
    price: '649',
    period: '/mes',
    description: 'Gobernanza y trazabilidad verificable para entornos con mayores requisitos de control.',
    badge: 'MÁS DEMANDADO',
    highlighted: true,
    features: [
      'Hasta 50 asientos ejecutivos y de revisión',
      'Despliegue centralizado en puestos de trabajo',
      'Hasta 100.000 evaluaciones preventivas al mes',
      'Verificación de integridad y sellado de registros',
      'Generación de informes estructurados y exportación PDF',
      'Políticas de protección de datos personalizadas'
    ],
    ctaText: 'Activar Plan Corporate',
    stripePaymentLink: import.meta.env.VITE_STRIPE_LINK_PRO || ''
  },
  {
    id: 'ENTERPRISE_1990',
    name: 'Enterprise',
    price: '1.990',
    period: '/mes',
    description: 'Infraestructura dedicada, integración con sistemas corporativos y soporte continuo.',
    badge: 'SOBERANÍA TOTAL',
    features: [
      'Asientos y volumen de registros adaptados a la operación',
      'Enrutamiento hacia modelos externos o despliegues propios',
      'Exportación hacia sistemas de monitorización y SIEM',
      'Notificaciones y alertas configurables',
      'Documentación técnica para procesos de auditoría',
      'Acuerdo de nivel de servicio y soporte dedicado'
    ],
    ctaText: 'Activar Plan Enterprise',
    stripePaymentLink: import.meta.env.VITE_STRIPE_LINK_ENTERPRISE || ''
  }
];

const getCleanApiBase = () => {
  const raw = String(import.meta.env.VITE_API_BASE_URL || API_HOST || 'https://api.saare.es')
    .trim()
    .replace(/\/+$/, '');
  return raw.replace(/\/api\/v1$/i, '').replace(/\/v1$/i, '');
};

export const PricingPlans = ({ onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSelectPlan = (plan) => {
    if (plan.isSandbox) {
      if (typeof onSelectPlan === 'function') {
        onSelectPlan('SANDBOX_FREE');
      } else {
        window.location.href = 'https://console.saare.es/?mode=sandbox&plan=SANDBOX_FREE&source=saare_suite';
      }
      return;
    }
    setSelectedPlan(plan);
    setStatusMessage('');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!corporateEmail.trim() || !companyName.trim() || !selectedPlan) return;

    setIsRedirecting(true);
    setStatusMessage('');

    const generatedTenantId = companyName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 24);

    try {
      if (selectedPlan.stripePaymentLink) {
        const url = new URL(selectedPlan.stripePaymentLink);
        url.searchParams.set('prefilled_email', corporateEmail.trim().toLowerCase());
        url.searchParams.set('client_reference_id', `${generatedTenantId}__${selectedPlan.id}`);
        window.location.href = url.toString();
        return;
      }

      const apiBase = getCleanApiBase();
      const res = await fetch(`${apiBase}/api/v1/billing/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          companyName: companyName.trim(),
          email: corporateEmail.trim().toLowerCase()
        })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      setStatusMessage(
        data.message || data.error || 'No se pudo iniciar la sesión de suscripción. Verifique la configuración de facturación.'
      );
    } catch {
      setStatusMessage('Error al conectar con el servicio de facturación. Inténtelo de nuevo.');
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <div className="w-full text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {B2B_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col justify-between rounded-2xl p-7 border transition ${
              plan.highlighted
                ? 'bg-slate-900 border-cyan-500 shadow-2xl shadow-cyan-500/10 relative'
                : plan.isSandbox
                ? 'bg-emerald-950/20 border-emerald-500/50 hover:border-emerald-400'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div>
              {plan.badge && (
                <span
                  className={`inline-block self-start px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wider uppercase border mb-4 ${
                    plan.isSandbox
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {plan.badge}
                </span>
              )}

              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <p className="mt-2 text-xs text-slate-400 min-h-[44px] leading-relaxed">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white">
                  {plan.price} €
                </span>
                {plan.period && (
                  <span className="text-xs text-slate-400">
                    {plan.period}{!plan.isSandbox ? ' + IVA' : ''}
                  </span>
                )}
              </div>

              <ul className="mt-6 space-y-3 text-xs text-slate-300 border-t border-slate-800 pt-5">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              onClick={() => handleSelectPlan(plan)}
              className={`mt-8 w-full py-3.5 px-4 rounded-lg font-extrabold text-xs uppercase tracking-wider transition cursor-pointer ${
                plan.isSandbox
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : plan.highlighted
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {plan.ctaText}
            </button>
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-cyan-400">
                Aprovisionar Entorno · {selectedPlan.name}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedPlan(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-5">
              Introduce los datos de tu organización para reservar tu identificador aislado antes de continuar con el proceso de contratación.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Organización / Razón Social
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                  Correo Corporativo
                </label>
                <input
                  type="email"
                  required
                  value={corporateEmail}
                  onChange={(e) => setCorporateEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                />
              </div>

              {statusMessage && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs">
                  {statusMessage}
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="w-1/3 py-2.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isRedirecting}
                  className="w-2/3 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  {isRedirecting ? 'Conectando...' : 'Continuar →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPlans;