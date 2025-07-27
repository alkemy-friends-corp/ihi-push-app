import { useTranslations } from '@/hooks/useTranslations';
import { StatCardProps } from './stat-card';
import {
  Users,
  Bell,
  MapPin,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

export const useDashboardData = (): Omit<StatCardProps, 'key'>[] => {
  const { t } = useTranslations();

  return [
    {
      title: t('admin.dashboard.stats.totalUsers'),
      value: 10,
      icon: Users,
      badges: [
        { label: t('admin.dashboard.badges.active'), value: 1, variant: 'default' as const },
        { label: t('admin.dashboard.badges.expired'), value: 2, variant: 'secondary' as const }
      ]
    },
    {
      title: t('admin.dashboard.stats.notifications'),
      value: 10,
      icon: Bell,
      badges: [
        { label: t('admin.dashboard.badges.scheduled'), value: 1, variant: 'outline' as const },
        { label: t('admin.dashboard.badges.today'), value: 1, variant: 'default' as const },
        { label: t('admin.dashboard.badges.pending'), value: 1, variant: 'secondary' as const }
      ]
    },
    {
      title: t('admin.dashboard.stats.locationNotifications'),
      value: 10,
      icon: MapPin,
      badges: [
        { label: t('admin.dashboard.badges.active'), value: 1, variant: 'default' as const }
      ]
    },
    {
      title: t('admin.dashboard.stats.disasterInfo'),
      value: 10,
      icon: AlertTriangle,
      badges: [
        { label: t('admin.dashboard.badges.active'), value: 1, variant: 'default' as const },
        { label: t('admin.dashboard.badges.emergency'), value: 1, variant: 'destructive' as const }
      ]
    },
    {
      title: t('admin.dashboard.stats.todayAccess'),
      value: 10,
      icon: TrendingUp,
      description: t('admin.dashboard.descriptions.todayAccess')
    }
  ];
}; 