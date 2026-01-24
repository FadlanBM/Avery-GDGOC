"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface ExportPDFButtonProps {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  companyName?: string;
}

export function ExportPDFButton({ dateRange, companyName }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Create a new PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Add header
      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.text("Recruitment Analytics Report", pageWidth / 2, 20, { align: "center" });

      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      if (companyName) {
        pdf.text(companyName, pageWidth / 2, 28, { align: "center" });
      }

      // Add date range
      const startDate = new Date(dateRange.startDate).toLocaleDateString("id-ID");
      const endDate = new Date(dateRange.endDate).toLocaleDateString("id-ID");
      pdf.setFontSize(10);
      pdf.text(`Periode: ${startDate} - ${endDate}`, pageWidth / 2, 35, { align: "center" });

      // Add generation timestamp
      const generatedAt = new Date().toLocaleString("id-ID");
      pdf.text(`Generated: ${generatedAt}`, pageWidth / 2, 40, { align: "center" });

      let yPosition = 50;

      // Capture metrics section
      const metricsElement = document.querySelector('[data-export="metrics"]');
      if (metricsElement) {
        const canvas = await html2canvas(metricsElement as HTMLElement, {
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      // Capture hiring funnel
      const funnelElement = document.querySelector('[data-export="funnel"]');
      if (funnelElement) {
        const canvas = await html2canvas(funnelElement as HTMLElement, {
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - 10) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Add new page for trends and table
      pdf.addPage();
      yPosition = 20;

      // Capture application trends
      const trendsElement = document.querySelector('[data-export="trends"]');
      if (trendsElement) {
        const canvas = await html2canvas(trendsElement as HTMLElement, {
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      }

      // Check if we need a new page for table
      if (yPosition > pageHeight - 80) {
        pdf.addPage();
        yPosition = 20;
      }

      // Capture top jobs table
      const tableElement = document.querySelector('[data-export="table"]');
      if (tableElement) {
        const canvas = await html2canvas(tableElement as HTMLElement, {
          logging: false,
          useCORS: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (yPosition + imgHeight > pageHeight - 10) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      }

      // Save the PDF
      const fileName = `analytics-report-${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Terjadi kesalahan saat mengekspor PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      variant="outline"
      size="default"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
}
