import { Skeleton } from "@/components/ui/skeleton"

export default function AnalyticsSkeletonLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 w-full animate-pulse">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4">
                <Skeleton className="h-[300px] w-full rounded-xl col-span-2" />
                <Skeleton className="h-[300px] w-full rounded-xl col-span-1" />
            </div>
        </div>
    )
}
