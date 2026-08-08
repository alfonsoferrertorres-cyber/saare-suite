import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export default function Legal() {
  const location = useLocation();
  const path = location.pathname;

  const content = {
    '/terms': {
      title: 'Términos de Servicio y Contratación B2B',
      subtitle: 'Condiciones Generales de Uso y Venta Corporativa (MS3V S.A.A.R.E. SL)',
      sections: [
        {
          heading: '1. Objeto y Titularidad',
          text: 'El presente documento regula la contratación de licencias y el acceso a SAARE Platform, comercializada por MS3V S.A.A.R.E. SL (CIF / B-XXXXXXXX) con domicilio en España. El uso comercial está reservado exclusivamente a personas jurídicas y entidades profesionales (B2B).'
        },
        {
          heading: '2. Licencias de Uso y Suscripción',
          text: 'Las suscripciones (Cloud Gateway, Embedded Native Engine y OEM Partner) se otorgan de forma no exclusiva y no transferible. La activación se realiza mediante el archivo firmado criptográficamente (saare.lic) emitido tras el pago validado en Stripe.'
        },
        {
          heading: '3. Pagos y Facturación UE',
          text: 'Los precios se indican en Euros (€) antes de impuestos. Para clientes intracomunitarios de la UE con VIES válido, se aplicará la inversión del sujeto pasivo del IVA. La facturación automatizada se gestiona a través de Stripe Billing.'
        }
      ]
    },
    '/privacy': {
      title: 'Política de Privacidad y Cumplimiento RGPD',
      subtitle: 'Tratamiento de Datos de Representantes y Telemetría Anónima',
      sections: [
        {
          heading: '1. Responsable del Tratamiento',
          text: 'MS3V S.A.A.R.E. SL trata los datos de contacto corporativo para la gestión de licencias, facturación e inspección L7. Datos de contacto: legal@saare.es.'
        },
        {
          heading: '2. Arquitectura Zero-Copy y Memoria RAM',
          text: 'El motor SAARE Policy Shield inspecciona el tráfico de prompts y LLMs exclusivamente en memoria RAM en tiempo real. No persistimos en disco datos PII, prompts ni respuestas de modelos de IA.'
        },
        {
          heading: '3. Derechos ARCO / RGPD',
          text: 'Cualquier usuario o empresa puede ejercer sus derechos de acceso, rectificación, supresión y oposición enviando un correo a support@saare.es adjuntando la identificación de la entidad.'
        }
      ]
    },
    '/eula': {
      title: 'Contrato de Licencia de Usuario Final (EULA)',
      subtitle: 'End User License Agreement para SAARE Policy Shield & Embedded SDK',
      sections: [
        {
          heading: '1. Restricciones de Ingenería Inversa',
          text: 'Queda estrictamente prohibida la descompilación, ingeniería inversa o manipulación del motor nativo (.dll / .so) y del mecanismo de firma criptográfica de licencias Ed25519.'
        },
        {
          heading: '2. Garantías de Rendimiento y SLA',
          text: 'SAARE garantiza una latencia de evaluación de política L7 inferior a 2ms en condiciones nominales. La responsabilidad total máxima se limita al importe pagado en la última anualidad.'
        },
        {
          heading: '3. Cumplimiento Regulatorio (EU AI Act & DORA)',
          text: 'El software se entrega para asistir en el cumplimiento del EU AI Act y DORA. La entidad cliente es responsable final de la configuración de sus reglas de gobernanza.'
        }
      ]
    }
  };

  const currentData = content[path] || content['/terms'];

  return (
    <div className="min-h-screen bg-[#050811] text-white pt-28 pb-20 px-6 sm:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Cabecera */}
        <div className="border-b border-slate-800 pb-8 space-y-3">
          <span className="font-mono text-[10px] font-bold text-[#C5A059] uppercase tracking-widest bg-[#C5A059]/10 px-3.5 py-1 rounded-full border border-[#C5A059]/30 inline-block">
            Legal & Compliance • MS3V S.A.A.R.E. SL
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-white">
            {currentData.title}
          </h1>
          <p className="text-slate-400 text-sm font-mono">
            {currentData.subtitle}
          </p>
        </div>

        {/* Contenido */}
        <div className="space-y-8 text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
          {currentData.sections.map((sec, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-xl space-y-2">
              <h3 className="text-base font-serif font-bold text-white text-[#00f0ff]">
                {sec.heading}
              </h3>
              <p>{sec.text}</p>
            </div>
          ))}
        </div>

        {/* Botón de regreso */}
        <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs font-mono">
          <Link to="/" className="text-slate-400 hover:text-white transition-all">
            ← Volver a SAARE Platform
          </Link>
          <span className="text-slate-500">Última actualización: Agosto 2026</span>
        </div>

      </div>
    </div>
  );
}