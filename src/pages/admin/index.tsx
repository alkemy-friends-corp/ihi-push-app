import type { ReactElement } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import type { NextPageWithLayout } from '../_app';
import { DashboardComponent } from '@/components/admin/dashboard';

const AdminDashboardPage: NextPageWithLayout = () => <DashboardComponent />;

AdminDashboardPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuard authRequired={true} adminRequired={true}>
      <AdminLayout activeModuleMenu="dashboard">{page}</AdminLayout>
    </AuthGuard>
  );
};

export default AdminDashboardPage; 