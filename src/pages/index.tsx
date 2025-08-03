import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { LoginComponent } from '@/components/auth/login';
import {NextPageWithLayout} from "./_app";

const LoginPage: NextPageWithLayout = () => <LoginComponent />;

LoginPage.getLayout = (page: ReactElement) => {
  return (
      <AuthGuardComponent authRequired={false}>
        {page}
      </AuthGuardComponent>
  );
};

export default LoginPage;