import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ResponsiveAdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveAdminLayout: React.FC<ResponsiveAdminLayoutProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "container mx-auto px-4 py-6 space-y-6",
      "sm:px-6 md:px-8 lg:px-12",
      className
    )}>
      <div className="grid grid-cols-1 gap-6">
        {children}
      </div>
    </div>
  );
};

interface AdminCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const AdminCard: React.FC<AdminCardProps> = ({
  title,
  description,
  children,
  className,
  contentClassName
}) => {
  return (
    <Card className={cn("w-full", className)}>
      {(title || description) && (
        <div className="p-6 pb-4 border-b">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}
      <CardContent className={cn(
        "p-6 space-y-4",
        // Mobile responsiveness
        "space-y-4 sm:space-y-6",
        contentClassName
      )}>
        {children}
      </CardContent>
    </Card>
  );
};

interface AdminGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export const AdminGrid: React.FC<AdminGridProps> = ({
  children,
  columns = 1,
  className
}) => {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
  };

  return (
    <div className={cn(
      "grid gap-4 sm:gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  );
};

interface AdminFormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminFormRow: React.FC<AdminFormRowProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col gap-4",
      "sm:flex-row sm:items-end sm:gap-6",
      className
    )}>
      {children}
    </div>
  );
};

interface AdminTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const AdminTableWrapper: React.FC<AdminTableWrapperProps> = ({
  children,
  className
}) => {
  return (
    <div className={cn(
      "overflow-x-auto",
      // Add horizontal scrolling on small screens
      "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
      className
    )}>
      <div className="min-w-full">
        {children}
      </div>
    </div>
  );
};

export default ResponsiveAdminLayout;