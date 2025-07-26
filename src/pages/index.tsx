import type { ReactElement } from 'react';
import { AuthGuard } from '@/components/shared/AuthGuard';
import { BasicLayout } from '@/components/layouts/BasicLayout';
import { LandingComponent } from '@/components/landing/LandingComponent';
import type { NextPageWithLayout } from './_app';

const HomePage: NextPageWithLayout = () => <LandingComponent />;

HomePage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuard authRequired={false}>
      <BasicLayout>{page}</BasicLayout>
    </AuthGuard>
  );
};

export default HomePage;
