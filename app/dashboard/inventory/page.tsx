
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function InventoryPage() {
    return (
        <div className="grid gap-4 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                    <CardDescription>
                        Manage your product stock efficiently.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Inventory table and controls will go here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
