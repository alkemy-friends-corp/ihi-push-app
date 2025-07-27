import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { BasicLayout } from '@/components/layouts/BasicLayout';
import type { NextPageWithLayout } from './_app';
import { LandingPageComponent } from '@/components/landing';

const HomePage: NextPageWithLayout = () => <LandingPageComponent />;

HomePage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      <BasicLayout>{page}</BasicLayout>
    </AuthGuardComponent>
  );
};

export default HomePage;
