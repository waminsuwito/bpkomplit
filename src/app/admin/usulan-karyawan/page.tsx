
'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Trash2, Inbox, User, MapPin, Clock } from 'lucide-react';
import type { Suggestion } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

const SUGGESTIONS_KEY = 'app-suggestions';
const suggestionsUpdatedEvent = new Event('suggestionsUpdated');

export default function UsulanKaryawanPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const loadSuggestions = () => {
        try {
          const storedData = localStorage.getItem(SUGGESTIONS_KEY);
          if (storedData) {
            const parsed: Suggestion[] = JSON.parse(storedData);
            parsed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setSuggestions(parsed);
          }
        } catch (error) {
          console.error("Failed to load suggestions:", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat usulan.' });
        }
    };
    loadSuggestions();

    window.addEventListener('storage', (e) => {
        if (e.key === SUGGESTIONS_KEY) loadSuggestions();
    });
    
    return () => {
        window.removeEventListener('storage', (e) => {
            if (e.key === SUGGESTIONS_KEY) loadSuggestions();
        });
    }

  }, [toast]);

  const updateSuggestions = (updated: Suggestion[]) => {
    setSuggestions(updated);
    localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(updated));
    window.dispatchEvent(suggestionsUpdatedEvent);
  };

  const handleMarkAsRead = (id: string) => {
    const updated = suggestions.map(r => r.id === id ? { ...r, status: 'read' as const } : r);
    updateSuggestions(updated);
  };

  const handleDelete = (id: string) => {
    const updated = suggestions.filter(r => r.id !== id);
    updateSuggestions(updated);
    toast({ variant: 'destructive', title: 'Dihapus', description: 'Usulan telah dihapus.' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          Usulan dari Karyawan
        </CardTitle>
        <CardDescription>
          Tinjau usulan dan ide perbaikan yang dikirimkan oleh karyawan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {suggestions.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger
                  onClick={() => {
                    if (item.status === 'new') handleMarkAsRead(item.id);
                  }}
                >
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-3">
                      <Badge variant={item.status === 'new' ? 'destructive' : 'secondary'}>
                        {item.status === 'new' ? 'Baru' : 'Dibaca'}
                      </Badge>
                      <div className="text-left">
                        <p className="font-semibold text-sm">Oleh: {item.reporterName}</p>
                        <p className="text-xs font-normal text-muted-foreground">
                            {format(new Date(item.timestamp), "d MMM yyyy, HH:mm", { locale: id })}
                        </p>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm bg-muted/30 p-3 rounded-md border">
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground"/> 
                        <strong>Pelapor:</strong> {item.reporterName} (NIK: {item.reporterNik})
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground"/> 
                        <strong>Lokasi:</strong> {item.location}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Isi Usulan:</h4>
                    <p className="whitespace-pre-wrap text-base bg-muted/50 p-4 rounded-md border">
                        {item.text}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Hapus Usulan
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <Inbox className="mx-auto h-12 w-12" />
            <h3 className="mt-4 text-lg font-semibold">Tidak Ada Usulan</h3>
            <p className="mt-1 text-sm">Belum ada usulan yang diterima dari karyawan.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
