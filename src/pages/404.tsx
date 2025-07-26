import type { ReactElement } from 'react';
import { AuthGuardComponent } from '@/components/shared';
import { BasicLayout } from '@/components/layouts/BasicLayout';
import { Button } from '@/components/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/card';
import { useRouter } from 'next/router';
import type { NextPageWithLayout } from './_app';

const NotFoundPage: NextPageWithLayout = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-gray-600 mb-4">404</div>
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
          <CardDescription>
            The page you're looking for doesn't exist or has been moved.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Check the URL for any typos or try navigating from the homepage.
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => router.push('/')}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Go to Home
            </Button>
            <Button 
              onClick={() => router.back()}
              variant="outline"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

NotFoundPage.getLayout = (page: ReactElement) => {
  return (
    <AuthGuardComponent authRequired={false}>
      <BasicLayout>{page}</BasicLayout>
    </AuthGuardComponent>
  );
};

export default NotFoundPage; 