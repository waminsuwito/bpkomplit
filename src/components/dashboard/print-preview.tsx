'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import Image from 'next/image';

interface PrintPreviewProps {
  data: any; // Ideally, a well-defined type
  onClose: () => void;
}

export function PrintPreview({ data, onClose }: PrintPreviewProps) {
  const handlePrint = () => {
    // This uses CSS media queries to print only the desired content
    window.print();
  };
  
  if (!data) return null;

  const {
    namaPelanggan,
    lokasiProyek,
    mutuBeton,
    targetVolume,
    slump,
    targetWeights,
    actualWeights,
    timestamp,
    jobId
  } = data;

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <SheetHeader className="p-6 bg-background border-b no-print">
        <SheetTitle>Print Preview</SheetTitle>
        <SheetDescription>
          Review the batch details below. Use the print button to get a physical copy.
        </SheetDescription>
      </SheetHeader>
      
      <div className="flex-grow overflow-y-auto p-4">
        <div id="print-content" className="bg-white text-black p-8 rounded-md shadow-lg max-w-2xl mx-auto font-sans">
          <header className="flex items-center justify-between border-b-2 border-black pb-4">
            <div className="flex items-center gap-4">
              <Image src="https://i.ibb.co/V0NgdX7z/images.jpg" alt="Company Logo" width={60} height={60} />
              <div>
                <h1 className="text-xl font-bold">PT. FARIKA RIAU PERKASA</h1>
                <p className="text-xs">Batching Plant</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <p><span className="font-bold">Job Order</span>: <span className="font-mono">{jobId}</span></p>
              <p><span className="font-bold">Tanggal</span>: <span className="font-mono">{new Date(timestamp).toLocaleDateString('id-ID')}</span></p>
              <p><span className="font-bold">Waktu</span>: <span className="font-mono">{new Date(timestamp).toLocaleTimeString('id-ID')}</span></p>
            </div>
          </header>

          <main className="my-6">
            <h2 className="text-lg font-bold text-center mb-4 uppercase">Tanda Terima & Hasil Produksi Beton</h2>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
                <div className="space-y-1 border border-black/50 p-3 rounded">
                    <h3 className="text-sm font-bold border-b border-black/20 pb-1 mb-2">DATA PELANGGAN</h3>
                    <p><span className="font-semibold inline-block w-28">Nama Pelanggan</span>: {namaPelanggan}</p>
                    <p><span className="font-semibold inline-block w-28">Lokasi Proyek</span>: {lokasiProyek}</p>
                </div>
                <div className="space-y-1 border border-black/50 p-3 rounded">
                    <h3 className="text-sm font-bold border-b border-black/20 pb-1 mb-2">DATA PRODUKSI</h3>
                    <p><span className="font-semibold inline-block w-28">Mutu Beton</span>: {mutuBeton}</p>
                    <p><span className="font-semibold inline-block w-28">Volume</span>: {targetVolume} M³</p>
                    <p><span className="font-semibold inline-block w-28">Slump</span>: {slump} cm</p>
                </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-bold border-b border-black/20 pb-1 mb-2">MATERIAL YANG DIGUNAKAN (Kg)</h3>
              <Table className="border text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-black font-bold border h-8">Material</TableHead>
                    <TableHead className="text-black font-bold text-right border h-8">Target</TableHead>
                    <TableHead className="text-black font-bold text-right border h-8">Aktual</TableHead>
                    <TableHead className="text-black font-bold text-right border h-8">Deviasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border py-1">Pasir + Batu (Aggregate)</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{targetWeights.aggregate.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{actualWeights.aggregate.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{(actualWeights.aggregate - targetWeights.aggregate).toFixed(1)}</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="border py-1">Semen</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{targetWeights.semen.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{actualWeights.semen.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{(actualWeights.semen - targetWeights.semen).toFixed(1)}</TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell className="border py-1">Air</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{targetWeights.air.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{actualWeights.air.toFixed(1)}</TableCell>
                    <TableCell className="text-right border py-1 font-mono">{(actualWeights.air - targetWeights.air).toFixed(1)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </main>

          <footer className="pt-8 text-center text-xs">
            <div className="flex justify-around">
                <div>
                    <p className="mb-12">Penerima,</p>
                    <p>(_________________________)</p>
                </div>
                 <div>
                    <p className="mb-12">Operator,</p>
                     <p>(_________________________)</p>
                </div>
                 <div>
                    <p className="mb-12">Quality Control,</p>
                     <p>(_________________________)</p>
                </div>
            </div>
            <p className="mt-6 text-gray-500 text-[10px]">Dokumen ini dibuat secara otomatis oleh sistem.</p>
          </footer>
        </div>
      </div>
      
      <div className="flex-shrink-0 p-4 border-t bg-background flex justify-end gap-2 no-print">
        <Button variant="outline" onClick={onClose}>Close</Button>
        <Button onClick={handlePrint}>Print</Button>
      </div>
    </div>
  );
}
