'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface StatusPanelProps {
  log: { message: string; id: number; color: string; timestamp: string }[];
  countdown: number | null;
  mixingTime: number;
}

export function StatusPanel({ log, countdown, mixingTime }: StatusPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const circumference = 2 * Math.PI * 42;

  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="items-center p-4">
        {countdown !== null && (
            <div className="mb-4">
                <div className="relative h-28 w-28">
                    <svg className="h-full w-full" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle
                            className="stroke-current text-primary/20"
                            strokeWidth="8"
                            cx="50"
                            cy="50"
                            r="42"
                            fill="transparent"
                        ></circle>
                        {/* Progress circle */}
                        <circle
                            className="stroke-current text-primary transition-all duration-1000 ease-linear"
                            strokeWidth="8"
                            cx="50"
                            cy="50"
                            r="42"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - (countdown / mixingTime))}
                            transform="rotate(-90 50 50)"
                        ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary font-mono">{countdown}</span>
                    </div>
                </div>
            </div>
        )}
        <CardTitle className="text-center text-primary uppercase text-sm tracking-wider">
          Aktifitas Berjalan
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col overflow-hidden p-4 pt-0">
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
