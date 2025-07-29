import React from "react";
import { LanguageSwitcher } from "../shared";
import { HeroSection } from "./hero";
import { ServiceExplanation } from "./service";
import { PWAInstallGuide } from "./pwa-guideline";
import { useTranslations } from "@/hooks/useTranslations";

const LandingPageComponent = () => {
    const { t } = useTranslations();
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
                        {/* {!isFormCompleted ? (
                            <TouristForm onComplete={handleFormComplete} />
                        ) : (
                            <Card className="border-green-200 bg-green-50">
                                <CardContent className="pt-6">
                                    <div className="text-center">
                                        <div className="text-4xl mb-2">🎉</div>
                                        <h3 className="font-bold text-green-800 mb-2">{t('form.complete.title')}</h3>
                                        <p className="text-green-700">
                                            {t('form.complete.message')}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )} */}
                        <PWAInstallGuide />
                        <div className="text-center text-sm text-muted-foreground py-6">
                            <p>{t('footer.enjoy')}</p>
                            <p className="mt-1">{t('footer.support')}</p>
                        </div>
                    </div>
                </div>
            </div>
            {/*<PWAInstallPrompt />*/}
        </div>
    );
} 

export default LandingPageComponent;

