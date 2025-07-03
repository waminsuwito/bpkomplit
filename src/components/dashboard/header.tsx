import { Building } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 z-10">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-semibold">batching-alchemy-control</h1>
      </div>
    </header>
  );
}
