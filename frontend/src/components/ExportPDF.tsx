"use client";

import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import type { AnalyzeInvestmentResponse } from "@/types/investment";

interface ExportPDFProps {
  result: AnalyzeInvestmentResponse;
  reportRef: React.RefObject<HTMLDivElement | null>;
}

export function ExportPDF({ result, reportRef }: ExportPDFProps) {
  const handleExport = async () => {
    if (!reportRef.current) return;

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfW = pdf.internal.pageSize.getWidth();
    const pdfH = pdf.internal.pageSize.getHeight();
    const imgH = (canvas.height * pdfW) / canvas.width;

    pdf.setFontSize(18);
    pdf.text("PropInvest AI - Investment Report", pdfW / 2, 20, { align: "center" });
    pdf.setFontSize(10);
    pdf.text("AI-powered Real Estate Investment Analysis", pdfW / 2, 28, {
      align: "center",
    });
    pdf.addImage(imgData, "PNG", 10, 35, pdfW - 20, Math.min(imgH, pdfH - 45));
    pdf.save("propinvest-report.pdf");
  };

  return (
    <button
      onClick={handleExport}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
    >
      Export as PDF
    </button>
  );
}
