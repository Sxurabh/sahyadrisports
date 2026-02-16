// app/dashboard/help/page.tsx
"use client"

import * as React from "react"
import {
    IconBook,
    IconMessageCircle,
    IconVideo,
    IconMail,
    IconPhone,
    IconSearch,
    IconChevronRight,
    IconHelpCircle,
    IconFileText,
    IconPlayerPlay
} from "@tabler/icons-react"

import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

const faqs = [
    {
        question: "How do I add a new product to my inventory?",
        answer: "To add a new product, navigate to the Products page and click the 'Add Product' button. Fill in the required details including name, category, price, and stock quantity. You can also upload product images and add descriptions."
    },
    {
        question: "How can I process a refund?",
        answer: "Go to the Orders page, find the specific order, and click on 'View Details'. From there, you can initiate a refund process. The refund will be processed to the original payment method within 5-7 business days."
    },
    {
        question: "What do the different order statuses mean?",
        answer: "Pending: Order received but not processed yet. Processing: Order is being prepared. Shipped: Order has been dispatched. Delivered: Order has been received by customer. Cancelled: Order has been cancelled."
    },
    {
        question: "How do I update my store information?",
        answer: "Navigate to Settings > General. Here you can update your store name, email, address, phone number, and other business details. Remember to save your changes."
    },
    {
        question: "Can I export my sales data?",
        answer: "Yes! Go to the Analytics or Reports section and click the 'Export' button. You can export data in CSV or Excel format for further analysis or accounting purposes."
    },
    {
        question: "How do I manage low stock alerts?",
        answer: "In the Settings > Notifications section, enable 'Low Stock Alerts'. You can also set the threshold for what constitutes 'low stock' in the Inventory settings."
    }
]

const guides = [
    {
        title: "Getting Started Guide",
        description: "Learn the basics of setting up your store",
        icon: IconBook,
        type: "Guide",
        readTime: "5 min"
    },
    {
        title: "Inventory Management",
        description: "Best practices for managing your products",
        icon: IconFileText,
        type: "Article",
        readTime: "8 min"
    },
    {
        title: "Order Processing Tutorial",
        description: "Step-by-step guide to handling orders",
        icon: IconPlayerPlay,
        type: "Video",
        readTime: "12 min"
    },
    {
        title: "Analytics & Reporting",
        description: "Understanding your store's performance",
        icon: IconFileText,
        type: "Article",
        readTime: "6 min"
    }
]

export default function HelpPage() {
    return (
        <div className="flex flex-col gap-6 p-4 lg:p-6 max-w-5xl">
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Find answers to common questions, browse our documentation, or contact our support team.
                </p>
                <div className="relative max-w-md mx-auto">
                    <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search for help..."
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Quick Contact Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <IconMessageCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Live Chat</CardTitle>
                            <CardDescription>Chat with our team</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            Available Monday to Friday, 9 AM - 6 PM IST
                        </p>
                        <Button variant="secondary" className="w-full">Start Chat</Button>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <IconMail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Email Support</CardTitle>
                            <CardDescription>Get help via email</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            We typically respond within 24 hours
                        </p>
                        <Button variant="secondary" className="w-full">Send Email</Button>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <IconPhone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Phone Support</CardTitle>
                            <CardDescription>Call us directly</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                            +91 22 1234 5678 (Toll-free)
                        </p>
                        <Button variant="secondary" className="w-full">Call Now</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Guides Section */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Popular Guides</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    {guides.map((guide, i) => (
                        <Card key={i} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                            <CardHeader className="flex flex-row items-start gap-4 pb-2">
                                <div className="p-2 bg-muted rounded-lg">
                                    <guide.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle className="text-base">{guide.title}</CardTitle>
                                        <Badge variant="secondary" className="text-xs">{guide.type}</Badge>
                                    </div>
                                    <CardDescription className="text-sm">
                                        {guide.description}
                                    </CardDescription>
                                </div>
                                <IconChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">{guide.readTime} read</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <IconHelpCircle className="h-5 w-5" />
                        Frequently Asked Questions
                    </CardTitle>
                    <CardDescription>
                        Quick answers to common questions about using Sahyadri Sports Admin.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, i) => (
                            <AccordionItem key={i} value={`item-${i}`}>
                                <AccordionTrigger className="text-left">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>

            {/* Documentation Link */}
            <Card className="bg-muted/50">
                <CardHeader>
                    <CardTitle>Need more help?</CardTitle>
                    <CardDescription>
                        Browse our comprehensive documentation for detailed guides and API references.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <a href="/dashboard/docs">
                            <IconBook className="mr-2 h-4 w-4" />
                            View Documentation
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}