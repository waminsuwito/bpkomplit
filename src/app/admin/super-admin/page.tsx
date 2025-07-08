import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Shield } from 'lucide-react';

export default function SuperAdminPage() {
  return (
    <div className="w-full max-w-4xl space-y-6 mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
             <Shield className="h-6 w-6 text-primary" />
             Super Admin Panel
          </CardTitle>
          <CardDescription>
            This area is restricted to super administrators for advanced system configuration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Super admin features will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
