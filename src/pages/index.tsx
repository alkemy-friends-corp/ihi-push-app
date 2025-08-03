import type { ReactElement } from 'react';
import { AuthGuardComponent, AdminLayout } from '@/components/shared';
import { DashboardComponent } from '@/components/admin/dashboard';
import type { NextPageWithLayout } from './_app';

const DashboardPage: NextPageWithLayout = () => <DashboardComponent />;

DashboardPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="dashboard">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default DashboardPage; 