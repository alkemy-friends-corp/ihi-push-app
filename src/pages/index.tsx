import { LandingPageComponent } from '@/components/landing';
import { AuthGuardComponent } from '@/components/shared';
import type { ReactElement } from 'react';
import type { NextPageWithLayout } from './_app';

const HomePage: NextPageWithLayout = () => <LandingPageComponent />;

HomePage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      {page}
    </AuthGuardComponent>
  );
};

export default HomePage;
