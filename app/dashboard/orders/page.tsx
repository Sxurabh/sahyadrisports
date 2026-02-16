
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function OrdersPage() {
    return (
        <div className="grid gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Orders Management</CardTitle>
                    <CardDescription>
                        View and manage customer orders.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Orders list and details will go here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
