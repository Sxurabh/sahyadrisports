import { Skeleton } from "@/components/ui/skeleton"

export default function TableSkeletonLoading() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 w-full animate-pulse">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-2">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-[200px] md:w-[250px]" />
                    <Skeleton className="h-10 w-[100px]" />
                </div>
            </div>

            <div className="space-y-3 mt-4">
                <Skeleton className="h-12 w-full rounded-t-md" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full rounded-b-md" />
            </div>

            <div className="flex items-center justify-between mt-2">
                <Skeleton className="h-4 w-[150px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    )
}
