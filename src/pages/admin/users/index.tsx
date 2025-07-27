import { AdminLayout, AuthGuardComponent } from '@/components/shared';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';

const UsersPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Device Management</h1>
      </div>
    </div>
  );
};

UsersPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="users">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default UsersPage; 