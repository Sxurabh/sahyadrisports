import { getInventoryReportData } from "@/app/actions";
import { InventoryReportClient } from "./inventory-report-client";

export default async function InventoryReportPage() {
    // Fetch data server-side
    const data = await getInventoryReportData();

    return <InventoryReportClient data={data} />;
}