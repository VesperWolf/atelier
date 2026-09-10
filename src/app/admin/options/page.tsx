import { getOptionCategories, getOptionValues } from "@/lib/actions/options";
import type { OptionCategory, OptionValue } from "@/types/database";
import AdminOptionsClient from "./AdminOptionsClient";

export default async function AdminOptionsPage() {
  const [categories, values] = await Promise.all([
    getOptionCategories(),
    getOptionValues(),
  ]);

  return (
    <AdminOptionsClient
      initialCategories={categories as OptionCategory[]}
      initialValues={values as OptionValue[]}
    />
  );
}
