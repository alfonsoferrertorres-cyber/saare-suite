#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_informe_corporativo.py — Generador de Resumen de Telemetría
S.A.A.R.E. Control Plane v10.0 / SGP 1.0
"""

import json
import sys
import os
from datetime import datetime

def generate_corporate_report(input_traces_file, output_report_file):
    if not os.path.exists(input_traces_file):
        print(f"[-] Error: No se encontró el archivo de trazas: {input_traces_file}")
        sys.exit(1)

    with open(input_traces_file, 'r', encoding='utf-8') as f:
        traces = json.load(f)

    total_inspections = len(traces)
    denied = [t for t in traces if t.get('decision') == 'DENY' or t.get('verdict') == 'RECHAZADO']
    allowed = total_inspections - len(denied)
    block_rate = round((len(denied) / total_inspections * 100), 2) if total_inspections > 0 else 0.0

    report = {
        "reportHeader": {
            "title": "INFORME CORPORATIVO DE GOBERNANZA IA Y RESILIENCIA OPERATIVA",
            "specification": "S.A.A.R.E. SGP 1.0 / Core PEP L7 v8.4",
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "auditAuthority": "Gabinete Técnico Comercial MS3V"
        },
        "metricsSummary": {
            "totalTracesInspected": total_inspections,
            "allowedRequests": allowed,
            "deniedRequests": len(denied),
            "blockRatePercentage": f"{block_rate}%",
            "ramZeroDiskStatus": "COMPLIANT_ACTIVE"
        },
        "auditedEvidenceSet": traces[:10]
    }

    with open(output_report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[+] Informe Corporativo generado en: {output_report_file}")

if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "traces.json"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "INFORME_CORPORATIVO_SAARE.json"
    generate_corporate_report(input_file, output_file)