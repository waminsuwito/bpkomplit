'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface ActivityPanelProps {
  log: { message: string; id: number; color: string; timestamp: string }[];
}

export function StatusPanel({ log }: ActivityPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">
          Aktifitas Berjalan
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-4">
        <div ref={scrollRef} className="flex-grow space-y-1.5 overflow-y-auto pr-2">
          {log.length === 0 ? (
             <div className="flex items-center justify-center h-full">
                <p className="text-center text-muted-foreground text-sm">
                    Sistem idle. Menunggu perintah...
                </p>
             </div>
          ) : (
            log.map((item) => (
              <p key={item.id} className={cn('text-sm font-medium transition-all duration-300', item.color)}>
                <span className="font-mono text-xs text-muted-foreground/80 mr-2">{item.timestamp}</span>
                {item.message}
              </p>
            ))
          )}
        </div>
        <Separator className="my-4 bg-primary/20" />
        <div className="text-center text-muted-foreground text-sm flex-shrink-0">
          <p>Arduino Mega2560 - USB Connected</p>
        </div>
      </CardContent>
    </Card>
  );
}
