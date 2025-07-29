import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { BasicLayout } from '@/components/layouts/BasicLayout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from './_app';

const ForbiddenPage: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-red-600 mb-4">403</div>
          <CardTitle className="text-2xl">Access Forbidden</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this page. This area is restricted to administrators only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            If you believe this is an error, please contact your system administrator.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => router.push('/auth/login')}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

ForbiddenPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      <BasicLayout>{page}</BasicLayout>
    </AuthGuardComponent>
  );
};

export default ForbiddenPage; 