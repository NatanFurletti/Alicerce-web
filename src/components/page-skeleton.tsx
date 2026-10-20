import { Skeleton } from '@/components/ui/skeleton';

/** Placeholder de página inteira enquanto a sessão ou os dados carregam. */
export function PageSkeleton() {
  return (
    <div
      className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-10"
      role="status"
      aria-label="Carregando"
    >
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
