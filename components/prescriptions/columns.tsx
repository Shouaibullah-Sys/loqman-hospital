// components/prescriptions/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Prescription } from "../../types/prescription";
import { Button } from "@/components/ui/button";
import { Download, Eye, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { faIR } from "date-fns/locale";
import { downloadPrescriptionPDFLegacy as downloadPrescriptionPDF } from "../../utils/generatePrescriptionPDF";
import { useState } from "react";

interface ColumnsProps {
  onViewDetails: (prescription: Prescription) => void;
}

export const useColumns = ({
  onViewDetails,
}: ColumnsProps): ColumnDef<Prescription>[] => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (prescription: Prescription) => {
    try {
      setDownloadingId(prescription.id);
      await downloadPrescriptionPDF(prescription);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return [
    {
      accessorKey: "patientName",
      header: "بیمار",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.original.patientName}</span>
        </div>
      ),
    },
    {
      accessorKey: "diagnosis",
      header: "تشخیص",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate" title={row.original.diagnosis}>
          {row.original.diagnosis}
        </div>
      ),
    },
    {
      accessorKey: "patientAge",
      header: "سن",
      cell: ({ row }) => (
        <div className="text-center">{row.original.patientAge || "-"}</div>
      ),
    },
    {
      accessorKey: "patientGender",
      header: "جنسیت",
      cell: ({ row }) => (
        <div className="text-center">{row.original.patientGender || "-"}</div>
      ),
    },
    {
      accessorKey: "prescriptionDate",
      header: "تاریخ",
      cell: ({ row }) => {
        const date = new Date(row.original.prescriptionDate);
        return (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{format(date, "yyyy/MM/dd", { locale: faIR })}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const dateA = new Date(rowA.original.prescriptionDate).getTime();
        const dateB = new Date(rowB.original.prescriptionDate).getTime();
        return dateA - dateB;
      },
    },
    {
      accessorKey: "prescription",
      header: "تعداد داروها",
      cell: ({ row }) => {
        const medicines = row.original.prescription || [];
        return (
          <div className="text-center">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {medicines.length} دارو
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "وضعیت",
      cell: ({ row }) => {
        const status = row.original.status;
        const statusConfig = {
          active: { label: "فعال", color: "bg-green-100 text-green-800" },
          completed: { label: "تکمیل شده", color: "bg-blue-100 text-blue-800" },
          cancelled: { label: "لغو شده", color: "bg-red-100 text-red-800" },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || {
          label: status,
          color: "bg-gray-100 text-gray-800",
        };

        return (
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "عملیات",
      cell: ({ row }) => {
        const prescription = row.original;
        const isDownloading = downloadingId === prescription.id;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewDetails(prescription)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              مشاهده جزئیات
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(prescription)}
              disabled={isDownloading}
              className="flex items-center gap-1"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900"></div>
                  ...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  PDF
                </>
              )}
            </Button>
          </div>
        );
      },
    },
  ];
};
