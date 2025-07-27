import { Badge } from '@/components/shadcn';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shadcn/card';
import { memo } from 'react';

// Types for better type safety
export interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  badges?: Array<{
    label: string;
    value: number;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  description?: string;
}

// Memoized stat card component for better performance
const StatCard = memo<StatCardProps>(({ title, value, icon: Icon, badges, description }) => (
  <Card className="transition-all duration-200 hover:shadow-md">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value.toLocaleString()}</div>
      {badges && (
        <div className="flex flex-wrap gap-2 mt-2">
          {badges.map((badge, index) => (
            <Badge key={index} variant={badge.variant}>
              {badge.label}: {badge.value}
            </Badge>
          ))}
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-2">
          {description}
        </p>
      )}
    </CardContent>
  </Card>
));

StatCard.displayName = 'StatCard';

export default StatCard; 