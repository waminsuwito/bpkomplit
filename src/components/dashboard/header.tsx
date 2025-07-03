import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 flex h-20 items-center justify-between gap-4 border-b border-primary/20 bg-background px-6 z-10">
      <div>
        <h1 className="text-2xl font-bold text-primary">PT. FARIKA RIAU PERKASA</h1>
        <p className="text-sm text-muted-foreground">Sistem Kontrol Otomatisasi Produksi Batching Plant</p>
      </div>
      <Button variant="outline">Admin Login</Button>
    </header>
  );
}
