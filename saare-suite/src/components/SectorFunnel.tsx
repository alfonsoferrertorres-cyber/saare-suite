import React from 'react';

interface SectorCardProps {
  title: string;
  focus: string;
  claim: string;
  ctaText: string;
}

interface SectorFunnelProps {
  onSelectSectorReport?: (sectorTitle: string) => void;
}

const sectors: SectorCardProps[] = [
  {
    title: 'Financiero & Fintech',
    focus: 'DORA / PCI-DSS',
    claim: 'Financia la adecuación a DORA con hasta 24.000 € de Kit Consulting.',
    ctaText: 'Audit de Resiliencia (Generar Informe)',
  },
  {
    title: 'Sanitario & E-Health',
    focus: 'HIPAA / RGPD / EUDAMED',
    claim: 'Despliega IA anonimizada en RAM financiada al 80% mediante Impulso Ecosistemas IA.',
    ctaText: 'Validador FHIR/DICOM (Generar Informe)',
  },
  {
    title: 'Industrial & Infraestructuras Críticas',
    focus: 'NIS2 / ENS Nivel Alto',
    claim: 'Securiza tu cadena de suministro TIC con subvenciones I+D+i del CDTI.',
    ctaText: 'Scanner NIS2 Ex-Ante (Generar Informe)',
  },
  {
    title: 'Despachos & Agentes de Software',
    focus: 'Kit Digital (Hasta 29.000 €)',
    claim: 'Instala la consola de ciberseguridad perimetral a coste 0 € para tu cliente.',
    ctaText: 'Acuerdo de Prestación (Generar Informe)',
  },
];

export const SectorFunnel: React.FC<SectorFunnelProps> = ({ onSelectSectorReport }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-saare-surface border border-saare-line text-saare-ink rounded-xl">
      {sectors.map((sector, index) => (
        <div 
          key={index} 
          className="border border-saare-line-hi p-6 rounded-lg bg-saare-surface-2 flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-mono font-bold bg-saare-accent/15 border border-saare-accent text-saare-accent px-2.5 py-1 rounded-sm uppercase tracking-wider">
              {sector.focus}
            </span>
            <h3 className="font-display text-xl font-bold mt-4 text-white">{sector.title}</h3>
            <p className="text-saare-ink-dim text-sm mt-2 leading-relaxed">{sector.claim}</p>
          </div>
          <button
            onClick={() => onSelectSectorReport && onSelectSectorReport(sector.title)}
            className="mt-6 w-full bg-saare-allow hover:bg-saare-allow/90 text-black font-bold py-2.5 px-4 text-xs rounded transition-all"
          >
            {sector.ctaText}
          </button>
        </div>
      ))}
    </div>
  );
};