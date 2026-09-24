import React from 'react';

interface SectorCardProps {
  title: string;
  focus: string;
  claim: string;
  ctaText: string;
}

interface SectorFunnelProps {
  onSelectSectorReport?: (sectorTitle: string) => void;
  onRequestTrial?: (sectorTitle: string) => void;
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

export const SectorFunnel: React.FC<SectorFunnelProps> = ({ onSelectSectorReport, onRequestTrial }) => {
  const handleAction = (sectorTitle: string) => {
    const token = localStorage.getItem('saare_token') || localStorage.getItem('saare_auth_token');
    
    // Si no hay sesión activa, deriva al alta de prueba (/trial)
    if (!token && onRequestTrial) {
      onRequestTrial(sectorTitle);
    } else if (onSelectSectorReport) {
      onSelectSectorReport(sectorTitle);
    } else {
      window.location.href = '/trial';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-900 border border-slate-800 text-slate-100 rounded-xl">
      {sectors.map((sector, index) => (
        <div 
          key={index} 
          className="border border-slate-700 p-6 rounded-lg bg-slate-950 flex flex-col justify-between"
        >
          <div>
            <span className="text-xs font-mono font-bold bg-sky-500/15 border border-sky-500 text-sky-400 px-2.5 py-1 rounded-sm uppercase tracking-wider">
              {sector.focus}
            </span>
            <h3 className="font-display text-xl font-bold mt-4 text-white">{sector.title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">{sector.claim}</p>
          </div>
          <button
            onClick={() => handleAction(sector.title)}
            className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2.5 px-4 text-xs rounded transition-all cursor-pointer font-mono"
          >
            {sector.ctaText}
          </button>
        </div>
      ))}
    </div>
  );
};