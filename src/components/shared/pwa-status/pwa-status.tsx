import React from 'react';
import { Badge } from '@/components/shadcn/badge';
import { CheckCircle, Smartphone, Download } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function PWAStatus() {
  const { isInstallable, isInstalled } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <Badge variant="secondary" className="text-xs">
          Installed
        </Badge>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <div className="flex items-center gap-2">
        <Download className="h-4 w-4 text-blue-600" />
        <Badge variant="default" className="text-xs">
          Installable
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Smartphone className="h-4 w-4 text-gray-600" />
      <Badge variant="outline" className="text-xs">
        Web App
      </Badge>
    </div>
  );
} 