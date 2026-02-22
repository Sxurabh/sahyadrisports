import { getDashboardStats, getDashboardChartData, getProducts } from '@/app/actions'
import { ChartAreaInteractive } from '@/components/chart-area-interactive'
import { DataTable } from '@/components/data-table'
import { SectionCards } from '@/components/section-cards'
import data from "./data.json"

export default async function DashboardPage() {
    const stats = await getDashboardStats()
    const chartData = await getDashboardChartData()
    const products = await getProducts()

    return (
        <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                    <SectionCards stats={stats} />
                    <div className="px-4 lg:px-6">
                        <ChartAreaInteractive data={chartData} />
                    </div>
                    {/* The table expects the schema layout without 'manager', which we will fix next */}
                    <DataTable data={products as any} />
                </div>
            </div>
        </div>
    )
}
