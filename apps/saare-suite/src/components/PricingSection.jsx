// saare-suite/src/components/PricingSection.jsx — Licenciamiento Comercial & Sandbox 0 € (SGP 1.0 Integ. Stripe)
import React, { useState } from 'react';

// Mapeo oficial de enlaces de pago de Stripe Checkout (SGP 1.0)
const STRIPE_PAYMENT_LINKS = {
  COMPLIANCE_249: {
    monthly: 'https://buy.stripe.com/afA4gza217ydegzagd8g006',
    annual: 'https://buy.stripe.com/fZu14n8XX5q5c8r9c98g008',
  },
  PROFESSIONAL_649: {
    monthly: 'https://buy.stripe.com/fZu5kD0rr5q5egz0FD8g007',
    annual: 'https://buy.stripe.com/bJe14n8XX4m18Wf5ZX8g009',
  },
};

export default function PricingSection({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [showFullComparison, setShowFullComparison] = useState(false);

  const isAnnual = billingCycle === 'annual';

  // Redirección directa según el plan y la modalidad de facturación
  const handlePlanSelect = (planId) => {
    // 1. Redirección a Stripe Checkout para planes de pago autoservicio
    if (STRIPE_PAYMENT_LINKS[planId]) {
      const stripeUrl = STRIPE_PAYMENT_LINKS[planId][billingCycle];
      window.location.href = stripeUrl;
      return;
    }

    // 2. Redirección a formulario para Enterprise y Despliegues Privados
    if (planId === 'ENTERPRISE_1500' || planId === 'PRIVATE_CUSTOM') {
      const evaluationElement = document.getElementById('evaluation');
      if (evaluationElement) {
        evaluationElement.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = '#evaluation';
      }
      return;
    }

    // 3. Redirección al registro de consola para Sandbox 0 €
    if (onSelectPlan) {
      onSelectPlan(planId);
    } else {
      const consoleUrl = import.meta.env.VITE_CONSOLE_URL || 'https://app.saare.es/register';
      window.location.href = consoleUrl;
    }
  };

  const plans = [
    {
      id: 'DISCOVER_FREE',
      name: 'Sandbox Evaluador',
      badge: 'Permanente 0 €',
      priceMonthly: 0,
      priceAnnual: 0,
      annualTotal: 0,
      period: 'Acceso Permanente',
      target: 'Desarrolladores, DPOs y Auditorías Técnicas',
      capacity: '1 Sistema IA · 2 Usuarios',
      limit: 'Ilimitado en Sandbox',
      highlightFeature: 'Capa de Control L7, Evaluación ISO 42001 y Bóveda Criptográfica',
      cta: 'Activar Sandbox 0 €',
      ctaStyle: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/20',
      featured: false
    },
    {
      id: 'COMPLIANCE_249',
      name: 'Compliance',
      badge: 'Gobernanza Base',
      priceMonthly: 249,
      priceAnnual: 199.20,
      annualTotal: '2.390,40',
      period: '€ / mes + IVA',
      target: 'SaaS en Crecimiento y Pymes',
      capacity: '3 Sistemas IA · 5 Usuarios',
      limit: '1.000 evidencias / mes',
      highlightFeature: 'GRC Automatizado, Bóveda SHA-256 e ISO 42001',
      cta: 'Contratar Compliance',
      ctaStyle: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600',
      featured: false
    },
    {
      id: 'PROFESSIONAL_649',
      name: 'Professional',
      badge: 'Recomendado ISVs',
      priceMonthly: 649,
      priceAnnual: 519.20,
      annualTotal: '6.230,40',
      period: '€ / mes + IVA',
      target: 'Empresas B2B e Integradores',
      capacity: '10 Sistemas IA · 15 Usuarios',
      limit: '5.000 evidencias / mes',
      highlightFeature: 'Gobernanza Avanzada + Intercepción Ex-Ante L7',
      cta: 'Contratar Professional',
      ctaStyle: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-lg shadow-cyan-500/25',
      featured: true
    },
    {
      id: 'ENTERPRISE_1500',
      name: 'Enterprise',
      badge: 'Corporativo',
      priceMonthly: 1500,
      priceAnnual: 1200,
      annualTotal: '14.400,00',
      period: '€ / mes + IVA (desde)',
      target: 'Multinacionales y Gran Cuenta',
      capacity: '50 Sistemas IA · 50+ Usuarios',
      limit: 'Nodo Dedicado y Cuotas Custom',
      highlightFeature: 'Integración SIEM/SOC, Llaves CMK y SLA Prioritario',
      cta: 'Contactar Enterprise',
      ctaStyle: 'bg-blue-600 hover:bg-blue-500 text-white font-bold',
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-6 bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-cyan-500/10 blur-[140px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-cyan-400 mb-4 font-mono">
            Estructura de Licenciamiento Transparente (SGP 1.0)
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Proteja sus sistemas de IA. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Escale la gobernanza sin restricciones de prueba.
            </span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg">
            Infraestructura ejecutable para productos con IA. Precios excluyen IVA.
          </p>

          <div className="mt-8 inline-flex items-center gap-3 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all ${
                !isAnnual ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
              }`}>
              Facturación Mensual
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
                isAnnual ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' : 'text-slate-400 hover:text-slate-200'
              }`}>
              Facturación Anual
              <span className="px-2 py-0.5 text-[10px] bg-emerald-400 text-slate-950 font-extrabold rounded-full uppercase">
                -20% Descuento
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-12">
          {plans.map((plan) => {
            const price = isAnnual ? plan.priceAnnual : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  plan.featured
                    ? 'bg-slate-900 border-2 border-cyan-400 shadow-2xl shadow-cyan-500/15 lg:-translate-y-2'
                    : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
                }`}>
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                    plan.id === 'DISCOVER_FREE' ? 'bg-emerald-400 text-slate-950' : 'bg-cyan-400 text-slate-950'
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 font-mono mt-1 mb-4 min-h-[32px] flex items-center">
                    {plan.target}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl md:text-4xl font-extrabold text-white">
                        {typeof price === 'number' ? `${price} €` : price}
                      </span>
                      <span className="text-xs text-slate-400">{plan.period}</span>
                    </div>
                    {isAnnual && typeof price === 'number' && price > 0 && (
                      <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                        Facturado anualmente ({plan.annualTotal} €/año)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 text-xs text-slate-300 border-b border-slate-800 pb-6 mb-6">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Capacidad</span>
                      <strong className="text-white">{plan.capacity}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Límite de Trazas</span>
                      <span className="text-slate-300">{plan.limit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase tracking-wider">Característica Clave</span>
                      <span className="text-cyan-400 font-medium">{plan.highlightFeature}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`w-full py-3 text-xs font-bold rounded-xl transition-all text-center cursor-pointer ${plan.ctaStyle}`}>
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-[10px] text-indigo-300 mb-2 font-mono">
              Infraestructura Soberana & Air-Gapped
            </div>
            <h3 className="text-2xl font-bold text-white">S.A.A.R.E. Private</h3>
            <p className="text-xs text-cyan-400 font-mono mb-2">Arquitectura de Despliegue Personalizado</p>
            <p className="text-sm text-slate-300 leading-relaxed">
              Instalación On-Premise, VPC aislada o Nube Soberana. Diseñado para entidades financieras, sector público e infraestructuras críticas que requieren llaves gestionadas por el cliente (CMK) y módulos HSM.
            </p>
          </div>
          <button
            type="button"
            onClick={() => handlePlanSelect('PRIVATE_CUSTOM')}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-700 shrink-0 transition-colors cursor-pointer">
            Diseñar Despliegue Privado
          </button>
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowFullComparison(!showFullComparison)}
            className="px-6 py-2.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-slate-900 border border-slate-800 rounded-xl transition-all cursor-pointer">
            {showFullComparison ? 'Ocultar Matriz de Especificaciones ▲' : 'Mostrar Matriz Completa de Especificaciones ▼'}
          </button>

          {showFullComparison && (
            <div className="mt-8 overflow-x-auto bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs">
              <table className="w-full text-slate-300">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-200 font-mono">
                    <th className="p-4">Capacidad / Módulo</th>
                    <th className="p-4 text-emerald-400">Sandbox (0 €)</th>
                    <th className="p-4">Compliance</th>
                    <th className="p-4 text-cyan-400">Professional</th>
                    <th className="p-4">Enterprise</th>
                    <th className="p-4">Private</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Sistemas IA Gestionados</td>
                    <td className="p-4 text-emerald-400 font-bold">1</td>
                    <td className="p-4">3</td>
                    <td className="p-4 text-cyan-400 font-bold">10</td>
                    <td className="p-4">50</td>
                    <td className="p-4 text-indigo-400">Ilimitado</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Usuarios Activos</td>
                    <td className="p-4 text-emerald-400 font-bold">2</td>
                    <td className="p-4">5</td>
                    <td className="p-4 text-cyan-400 font-bold">15</td>
                    <td className="p-4">50+</td>
                    <td className="p-4 text-indigo-400">Ilimitado</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Bóveda Criptográfica (SHA-256)</td>
                    <td className="p-4 text-emerald-400 font-bold">✓ Local</td>
                    <td className="p-4">✓ Cloud D1</td>
                    <td className="p-4 text-cyan-400 font-bold">✓ Cloud D1 + KV</td>
                    <td className="p-4">✓ Dedicada</td>
                    <td className="p-4 text-indigo-400">✓ On-Prem / HSM</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Intercepción Ex-Ante L7</td>
                    <td className="p-4 text-slate-500">Pruebas</td>
                    <td className="p-4">Básica</td>
                    <td className="p-4 text-cyan-400 font-bold">Avanzada</td>
                    <td className="p-4">Personalizada</td>
                    <td className="p-4 text-indigo-400">Motor Air-Gapped</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">Evaluación ISO 42001 / EU AI Act</td>
                    <td className="p-4 text-emerald-400 font-bold">✓ Manual</td>
                    <td className="p-4">✓ Automatizada</td>
                    <td className="p-4 text-cyan-400 font-bold">✓ Automatizada</td>
                    <td className="p-4">✓ Continua</td>
                    <td className="p-4 text-indigo-400">✓ Custom Compliance</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-sans font-semibold text-white">SLA y Soporte Técnico</td>
                    <td className="p-4 text-slate-500">Comunidad</td>
                    <td className="p-4">Email 48h</td>
                    <td className="p-4 text-cyan-400 font-bold">Prioritario 24h</td>
                    <td className="p-4">SLA 99.9% + CSM</td>
                    <td className="p-4 text-indigo-400">SLA 99.99% Dedicado</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}