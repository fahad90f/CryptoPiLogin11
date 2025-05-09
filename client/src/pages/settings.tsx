import { MainLayout } from "@/components/layouts/MainLayout";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Helmet } from "react-helmet";

export default function Settings() {
  return (
    <>
      <Helmet>
        <title>Settings | CryptoPilot</title>
        <meta name="description" content="Configure your CryptoPilot account settings. Manage security, notifications, API access, and preferences for cryptocurrency flash token operations." />
      </Helmet>
      <MainLayout title="Settings" subtitle="Configure your account preferences and security options">
        <div className="max-w-4xl mx-auto">
          <SettingsForm />
        </div>
      </MainLayout>
    </>
  );
}
