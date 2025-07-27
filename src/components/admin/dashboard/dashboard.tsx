import { useTranslations } from '@/hooks/useTranslations';
import StatCard from './stat-card';
import { useDashboardData } from './use-dashboard-data';
import { memo } from 'react';

const DashboardComponent = () => {
  const { t } = useTranslations();
  const dashboardData = useDashboardData();

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.dashboard.welcome')}
        </p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {dashboardData.map((data, index) => (
          <StatCard
            key={index}
            {...data}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(DashboardComponent);