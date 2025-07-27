import type { ReactElement } from 'react';
import { AuthGuardComponent, AdminLayout } from '@/components/shared';
import { DeviceManagerComponent } from '@/components/admin/device-manager';
import type { NextPageWithLayout } from '../../_app';

const DeviceManagerPage: NextPageWithLayout = () => <DeviceManagerComponent />;

DeviceManagerPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="users">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default DeviceManagerPage; 