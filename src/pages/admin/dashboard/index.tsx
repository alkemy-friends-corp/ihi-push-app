import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { DashboardComponent } from '@/components/admin/dashboard';
import type { NextPageWithLayout } from '../../_app';

const DashboardPage: NextPageWithLayout = () => <DashboardComponent />;

DashboardPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeModuleMenu="dashboard">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default DashboardPage; 