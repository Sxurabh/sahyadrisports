import { getAppSettings } from '@/app/actions'
import { SettingsClient } from './settings-client'

export const metadata = {
    title: "Settings - Sahyadri Sports",
    description: "Manage your store settings, preferences, and account details.",
}

export default async function SettingsPage() {
    const settings = await getAppSettings()

    return <SettingsClient settings={settings} />
}