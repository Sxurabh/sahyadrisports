// app/dashboard/docs/page.tsx
import { IconBook, IconFileText, IconVideo, IconExternalLink } from "@tabler/icons-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const docSections = [
    {
        title: "Getting Started",
        description: "Learn the basics of using Sahyadri Sports Admin",
        icon: IconBook,
        articles: [
            "Quick Start Guide",
            "Dashboard Overview",
            "Setting Up Your Store",
            "Managing User Permissions"
        ]
    },
    {
        title: "Product Management",
        description: "Complete guide to managing your inventory",
        icon: IconFileText,
        articles: [
            "Adding New Products",
            "Managing Stock Levels",
            "Product Categories",
            "Bulk Import/Export"
        ]
    },
    {
        title: "Order Processing",
        description: "Learn how to handle customer orders",
        icon: IconFileText,
        articles: [
            "Order Lifecycle",
            "Processing Payments",
            "Shipping & Fulfillment",
            "Handling Returns"
        ]
    },
    {
        title: "Video Tutorials",
        description: "Step-by-step video guides",
        icon: IconVideo,
        articles: [
            "Platform Walkthrough",
            "Advanced Features",
            "Integration Setup",
            "Troubleshooting"
        ]
    }
]

export default function DocumentationPage() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground">
                    Learn how to use Sahyadri Sports Admin effectively.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {docSections.map((section, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <section.icon className="h-5 w-5 text-primary" />
                                </div>
                                <CardTitle>{section.title}</CardTitle>
                            </div>
                            <CardDescription>{section.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {section.articles.map((article, j) => (
                                    <li key={j}>
                                        <Button variant="ghost" className="w-full justify-start h-auto py-2 px-3">
                                            <IconExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                                            {article}
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Need personalized help?</CardTitle>
                    <CardDescription>
                        Our support team is available to help you with any questions.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <Button>Contact Support</Button>
                    <Button variant="outline">Schedule Training</Button>
                </CardContent>
            </Card>
        </div>
    )
}