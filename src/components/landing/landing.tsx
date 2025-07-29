import React, { useState } from "react";
import { LanguageSwitcher } from "../shared";
import { HeroSection } from "./hero";
import { ServiceExplanation } from "./service";
import { PWAInstallGuide } from "./pwa-guideline";
import NotificationRegistration from "./notification-registration";
import { useTranslations } from "@/hooks/useTranslations";

const LandingPageComponent = () => {
    const { t } = useTranslations();
    const [isFormCompleted, setIsFormCompleted] = useState(false);

    const handleFormComplete = () => {
        setIsFormCompleted(true);
    };

    return (
        <div className="relative">
            <div className="absolute top-4 right-4 z-50">
                <LanguageSwitcher />
            </div>
            <HeroSection />
            <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="container mx-auto px-4 py-8 max-w-md">
                    <div className="space-y-6">
                        <ServiceExplanation />
                        {!isFormCompleted ? (
                            <NotificationRegistration onComplete={handleFormComplete} />
                        ) : (
                            <div className="text-center text-sm text-muted-foreground py-6">
                                <p>{t('footer.enjoy')}</p>
                                <p className="mt-1">{t('footer.support')}</p>
                            </div>
                        )}
                        <PWAInstallGuide />
                    </div>
                </div>
            </div>
        </div>
    );
} 

export default LandingPageComponent;

