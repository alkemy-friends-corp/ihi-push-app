import { AdminLayout, AuthGuardComponent } from '@/components/shared';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from '../../_app';

const MapPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Location Notifications</h1>
      </div>
    </div>
  );
};

MapPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="map">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default MapPage; 