import type { ReactElement } from 'react';
import { AuthGuardComponent, AdminLayout } from '@/components/shared';
import type { NextPageWithLayout } from '../../_app';

const NotificationsPage: NextPageWithLayout = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Notifications</h1>
        {/* <Button>
          <Send className="mr-2 h-4 w-4" />
          Send New Notification
        </Button> */}
      </div>
    </div>
  );
};

NotificationsPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={true}>
      <AdminLayout activeMenu="notifications">{page}</AdminLayout>
    </AuthGuardComponent>
  );
};

export default NotificationsPage; 