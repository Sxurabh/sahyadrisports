import { getSalesReportData } from "@/app/actions";
import { SalesReportClient } from "./sales-report-client";

export default async function SalesReportPage() {
    // Fetch data server-side
    const data = await getSalesReportData();

    return <SalesReportClient data={data} />;
}