import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { DeviceManagerComponent } from '@/components/admin/device-manager';
import type { NextPageWithLayout } from '../../_app';

const DeviceManagerPage: NextPageWithLayout = () => <DeviceManagerComponent />;

DeviceManagerPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeModuleMenu="device-manager">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default DeviceManagerPage; 