import {
  getConsultations,
  getConsultationStatusCounts,
} from "@/lib/actions/consultations";
import type { Consultation } from "@/types/database";
import AdminConsultationsClient from "./AdminConsultationsClient";

export default async function AdminConsultationsPage() {
  const [consultations, statusCounts] = await Promise.all([
    getConsultations(),
    getConsultationStatusCounts(),
  ]);

  return (
    <AdminConsultationsClient
      initialConsultations={consultations as Consultation[]}
      statusCounts={statusCounts}
    />
  );
}
