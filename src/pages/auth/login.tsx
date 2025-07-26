import type { ReactElement } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import type { NextPageWithLayout } from '../_app';
import { LoginComponent } from '@/components/auth/login';

const LoginPage: NextPageWithLayout = () => <LoginComponent />;

LoginPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuard authRequired={false}>
      {page}
    </AuthGuard>
  );
};

export default LoginPage; 