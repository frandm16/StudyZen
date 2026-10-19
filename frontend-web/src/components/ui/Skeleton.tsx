import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className = '', rounded = 'md', ...props }: SkeletonProps) {
    const radius = {
        sm: 'rounded',
        md: 'rounded-md',
        lg: 'rounded-xl',
        full: 'rounded-full',
    }[rounded];

    return <div aria-hidden="true" className={`skeleton-shimmer ${radius} ${className}`} {...props} />;
}

export function SkeletonRows({ count = 3 }: { count?: number }) {
    return <div className="space-y-3" aria-hidden="true">
        {Array.from({ length: count }, (_, index) => <div key={index} className="flex items-center gap-3 py-2">
            <Skeleton className="h-8 w-8 shrink-0" rounded="full" />
            <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-2.5 w-1/3" />
            </div>
        </div>)}
    </div>;
}
