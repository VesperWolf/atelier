import { getQuotes } from "@/lib/actions/quotes";
import type { Quote } from "@/types/database";
import AdminQuotesClient from "./AdminQuotesClient";

export default async function AdminQuotesPage() {
  const quotes = await getQuotes();
  return <AdminQuotesClient initialQuotes={quotes as (Quote & { items?: unknown[] })[]} />;
}
