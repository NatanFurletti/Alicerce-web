import { Skeleton } from '@/components/ui/skeleton';

export function FormSkeleton({ fields }: { fields: number }) {
  return (
    <div className="flex flex-col gap-6" role="status" aria-label="Carregando formulário">
      {Array.from({ length: fields }, (_, index) => (
        <div key={index} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
      <Skeleton className="h-9 w-full" />
    </div>
  );
}
