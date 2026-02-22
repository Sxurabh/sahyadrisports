"use client"

import * as React from "react"
import { motion } from "framer-motion"

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex-1 w-full"
        >
            {children}
        </motion.div>
    )
}
