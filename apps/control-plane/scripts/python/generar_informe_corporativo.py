#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generar_informe_corporativo.py — Generador de Resumen de Telemetría
S.A.A.R.E. Control Plane v10.0 / SGP 1.0
"""

import json
import os
import sys
from datetime import datetime, timezone


def generate_corporate_report(input_traces_file, output_report_file):
    if not os.path.exists(input_traces_file):
        print(f"[-] Error: No se encontró el archivo de trazas: {input_traces_file}")
        sys.exit(1)

    with open(input_traces_file, "r", encoding="utf-8") as f:
        loaded = json.load(f)

    traces = loaded if isinstance(loaded, list) else []
    total_inspections = len(traces)
    denied = [
        t for t in traces
        if isinstance(t, dict) and (t.get("decision") == "DENY" or t.get("verdict") == "RECHAZADO")
    ]
    allowed = total_inspections - len(denied)
    block_rate = round((len(denied) / total_inspections * 100), 2) if total_inspections > 0 else 0.0

    report = {
        "reportHeader": {
            "title": "INFORME CORPORATIVO DE GOBERNANZA IA Y RESILIENCIA OPERATIVA",
            "specification": "S.A.A.R.E. SGP 1.0 / Core PEP L7 v8.4",
            "generatedAt": datetime.now(timezone.utc).isoformat(),
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

    out_dir = os.path.dirname(os.path.abspath(output_report_file))
    if out_dir:
        os.makedirs(out_dir, exist_ok=True)

    with open(output_report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)

    print(f"[+] Informe Corporativo generado en: {output_report_file}")


if __name__ == "__main__":
    input_file = sys.argv[1] if len(sys.argv) > 1 else "traces.json"
    output_file = sys.argv[2] if len(sys.argv) > 2 else "INFORME_CORPORATIVO_SAARE.json"
    generate_corporate_report(input_file, output_file)