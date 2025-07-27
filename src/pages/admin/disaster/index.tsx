import { AdminLayout, AuthGuardComponent } from '@/components/shared';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';

const DisasterPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Disaster Management</h1>
      </div>
    </div>
  );
};

DisasterPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="disaster">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default DisasterPage; 