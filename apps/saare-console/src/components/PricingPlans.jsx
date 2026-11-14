import React, { useState } from 'react';

const B2B_PLANS = [
  {
    id: 'STARTER_249',
    name: 'Equipo Ágil / PyME',
    price: '249',
    period: '/mes',
    description: 'Protección perimetral esencial para equipos que adoptan IA generativa bajo RGPD.',
    badge: null,
    features: [
      'Hasta 10 asientos operativos (RBAC)',
      'Extensión L7 Proxy (Chrome, Edge, Brave)',
      'Sanitización automática de PII y API Keys en RAM',
      '10.000 inspecciones ex-ante / mes',
      'Bóveda de evidencias D1 aislada por Tenant'
    ],
    ctaText: 'Contratar Plan Equipo',
    stripePaymentLink: import.meta.env.VITE_STRIPE_LINK_STARTER || ''
  },
  {
    id: 'PROFESSIONAL_649',
    name: 'Corporate GRC',
    price: '649',
    period: '/mes',
    description: 'Gobernanza integral auditada para cumplimiento EU AI Act, DORA y secretos empresariales.',
    badge: 'MÁS DEMANDADO',
    highlighted: true,
    features: [
      'Hasta 50 asientos ejecutivos (CISO, DPO, Auditor)',
      'Despliegue silencioso masivo vía GPO (.reg)',
      '100.000 inspecciones ex-ante / mes',
      'Anclaje periódico de Raíces Merkle + Safe Creative',
      'Generación de informes FRIA y exportación PDF oficial',
      'Reglas DLP personalizadas por organización'
    ],
    ctaText: 'Activar Corporate GRC',
    stripePaymentLink: import.meta.env.VITE_STRIPE_LINK_PRO || ''
  },
  {
    id: 'ENTERPRISE_CUSTOM',
    name: 'Enterprise & Sector Público',
    price: 'A medida',
    period: '',
    description: 'Infraestructura dedicada, integración SIEM y soporte para licitaciones / Kit Consulting.',
    badge: 'SOBERANÍA TOTAL',
    features: [
      'Asientos y volumen de trazas ilimitados',
      'Enrutamiento hacia modelos On-Premise / Ollama',
      'Exportación en tiempo real hacia SIEM corporativo',
      'Alertas críticas multicanal CPaaS con failover',
      'Paquetes documentales para subvenciones públicas',
      'SLA garantizado 99.95% y soporte CISO 24/7'
    ],
    ctaText: 'Solicitar Despliegue Dedicado',
    stripePaymentLink: ''
  }
];

export const PricingPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [corporateEmail, setCorporateEmail] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setStatusMessage('');
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!corporateEmail.trim() || !companyName.trim() || !selectedPlan) return;

    setIsRedirecting(true);
    setStatusMessage('');

    // Normalizar identificador de Tenant a partir del nombre de la empresa
    const generatedTenantId = companyName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 24);

    try {
      // Si existe Payment Link directo de Stripe en variables de entorno, adjuntar metadatos
      if (selectedPlan.stripePaymentLink) {
        const url = new URL(selectedPlan.stripePaymentLink);
        url.searchParams.set('prefilled_email', corporateEmail.trim());
        url.searchParams.set('client_reference_id', `${generatedTenantId}__${selectedPlan.id}`);
        window.location.href = url.toString();
        return;
      }

      // Flujo alternativo: solicitar sesión de checkout al Control Plane
      const apiBase = (import.meta.env.VITE_API_BASE_URL || 'https://api.saare.es').replace(/\/+$/, '');
      const res = await fetch(`${apiBase}/v1/billing/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan.id,
          tenantId: generatedTenantId,
          companyName: companyName.trim(),
          email: corporateEmail.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
          return;
        }
      }

      // Fallback para entorno demo o contacto Enterprise
      setStatusMessage(
        `Solicitud registrada para ${companyName} (Tenant: ${generatedTenantId}). Redirigiendo al entorno de aprovisionamiento...`
      );
      setTimeout(() => {
        window.location.href = `https://console.saare.es/?tenant=${encodeURIComponent(generatedTenantId)}&role=CISO_ADMIN`;
      }, 1800);
    } catch (err) {
      setStatusMessage('Error al conectar con la pasarela de aprovisionamiento. Inténtalo de nuevo.');
    } finally {
      setIsRedirecting(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-slate-950 text-white px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Licenciamiento Corporativo y Aprovisionamiento Inmediato
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            Cada suscripción aprovisiona automáticamente tu Bóveda WORM aislada en Cloudflare D1 y habilita el emparejamiento en 1 clic con la extensión L7.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {B2B_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`flex flex-col justify-between rounded-2xl p-8 border transition ${
                plan.highlighted
                  ? 'bg-slate-900 border-cyan-500 shadow-2xl shadow-cyan-500/10 relative'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.badge && (
                <span className="inline-block self-start px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4">
                  {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="mt-2 text-sm text-slate-400 min-h-[40px]">{plan.description}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    {plan.price !== 'A medida' ? `${plan.price} €` : plan.price}
                  </span>
                  {plan.period && <span className="text-sm text-slate-400">{plan.period} + IVA</span>}
                </div>

                <ul className="mt-8 space-y-3.5 text-sm text-slate-300 border-t border-slate-800 pt-6">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`mt-8 w-full py-3.5 px-5 rounded-lg font-extrabold text-sm uppercase tracking-wider transition cursor-pointer ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>

        {/* Modal de Pre-Aprovisionamiento antes de saltar a Stripe */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-extrabold text-cyan-400">
                  Aprovisionar Tenant · {selectedPlan.name}
                </h3>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5">
                Introduce los datos de tu organización para reservar tu identificador aislado en la Bóveda D1 antes de completar la suscripción.
              </p>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Organización / Razón Social
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Finanzas Ibérica S.A."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-300 mb-1">
                    Email del Custodio Principal (CISO / Admin)
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ciso@tuempresa.es"
                    value={corporateEmail}
                    onChange={(e) => setCorporateEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {statusMessage && (
                  <div className="p-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs">
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
                    {isRedirecting ? 'Conectando...' : 'Continuar a Pasarela →'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingPlans;