import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { BasicLayout } from '@/components/layouts/BasicLayout';
import { LandingComponent } from '@/components/landing/LandingComponent';
import type { NextPageWithLayout } from './_app';

const HomePage: NextPageWithLayout = () => <LandingComponent />;

HomePage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      <BasicLayout>{page}</BasicLayout>
    </AuthGuardComponent>
  );
};

export default HomePage;
