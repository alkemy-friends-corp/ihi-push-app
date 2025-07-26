import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import type { NextPageWithLayout } from '../_app';
import { LoginComponent } from '@/components/auth/login';

const LoginPage: NextPageWithLayout = () => <LoginComponent />;

LoginPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      {page}
    </AuthGuardComponent>
  );
};

export default LoginPage; 