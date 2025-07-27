  import { Card, CardContent } from "@/components/shadcn/card";
import { useTranslations } from "@/hooks/useTranslations";

const newCoupleImage = '/images/Toyosuspots.png';

export function ServiceExplanation() {
  const { t } = useTranslations();

  return (
    <Card className="border bg-white overflow-hidden !p-0">
      <CardContent className="p-0 !pb-0">
        <div 
          className="relative min-h-[780px] bg-cover bg-center  bg-no-repeat"
          style={{ backgroundImage: `url(${newCoupleImage})` }}
        >
          <div className="relative z-10 px-6 pt-8 pb-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 leading-tight text-gray-900">
                  {t('service.title')}
                </h2>
                <p className="text-gray-800 mb-6 leading-relaxed">
                  {t('service.subtitle')}
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-gray-800 leading-relaxed">
                  <span className="font-semibold text-gray-900">
                    {t('service.notification.title')}
                  </span>
                  {t('service.notification.description')}
                </p>
                <p className="text-gray-800 leading-relaxed">
                  {t('service.conclusion')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}