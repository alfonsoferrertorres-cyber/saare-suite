// components/SectorFunnel.tsx
import React, { useState } from 'react';

interface SectorCardProps {
  title: string;
  focus: string;
  claim: string;
  ctaText: string;
  onAction: () => void;
}

const sectors: SectorCardProps[] = [
  {
    title: 'Financiero & Fintech',
    focus: 'DORA / PCI-DSS',
    claim: 'Financia la adecuación a DORA con hasta 24.000 € de Kit Consulting.',
    ctaText: 'Audit de Resiliencia en 1 Clic',
    onAction: () => alert('Descargando plantilla DORA...'),
  },
  {
    title: 'Sanitario & E-Health',
    focus: 'HIPAA / RGPD / EUDAMED',
    claim: 'Despliega IA anonimizada en RAM financiada al 80% mediante Impulso Ecosistemas IA.',
    ctaText: 'Validador de Anonimización FHIR/DICOM',
    onAction: () => alert('Iniciando validador FHIR...'),
  },
  {
    title: 'Industrial & Infraestructuras Críticas',
    focus: 'NIS2 / ENS Nivel Alto',
    claim: 'Securiza tu cadena de suministro TIC con subvenciones I+D+i del CDTI.',
    ctaText: 'Scanner de Vulnerabilidades L7 Ex-Ante',
    onAction: () => alert('Ejecutando escáner NIS2...'),
  },
  {
    title: 'Despachos & Agentes de Software',
    focus: 'Kit Digital (Hasta 29.000 €)',
    claim: 'Instala la consola de ciberseguridad perimetral a coste 0 € para tu cliente.',
    ctaText: 'Generador de Acuerdo de Prestación',
    onAction: () => alert('Generando borrador de acuerdo...'),
  },
];

export const SectorFunnel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-900 text-white rounded-xl">
      {sectors.map((sector, index) => (
        <div key={index} className="border border-slate-700 p-5 rounded-lg bg-slate-800 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold bg-blue-600 px-2 py-1 rounded-full uppercase tracking-wide">
              {sector.focus}
            </span>
            <h3 className="text-xl font-bold mt-3">{sector.title}</h3>
            <p className="text-slate-300 text-sm mt-2">{sector.claim}</p>
          </div>
          <button
            onClick={sector.onAction}
            className="mt-5 w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold py-2 px-4 rounded transition-colors"
          >
            {sector.ctaText}
          </button>
        </div>
      ))}
    </div>
  );
};