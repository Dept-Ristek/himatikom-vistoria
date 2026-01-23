'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { apiUrl } from '@/lib/api';

export default function ScanPage() {
  const scannerId = 'reader';  
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScannedRef = useRef<string>('');  
  const scanCountRef = useRef(0);
  
  // State UI
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompting'>('prompting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDebug, setShowDebug] = useState(false);

  const handleProcessScan = async (decodedText: string) => {
    if (lastScannedRef.current === decodedText) return;
    lastScannedRef.current = decodedText;
    
    if (isProcessing) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setResult({ text: 'Sesi habis. Silakan login ulang.', type: 'error' });
        setTimeout(() => setResult(null), 3000);
        setIsProcessing(false);
        return;
      }

      // Panggil API Absensi
      const res = await fetch(apiUrl('/api/attendance/scan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ qr_code: decodedText }),
      });

      const data = await res.json();

      if (data.status) {
        scanCountRef.current += 1;
        setResult({ text: `Absensi Berhasil! (${data.data?.agenda || 'Agenda'})`, type: 'success' });
        setTimeout(() => setResult(null), 3000);
      } else {
        setResult({ text: data.message || 'Absensi Gagal', type: 'error' });
        setTimeout(() => setResult(null), 3000);
      }
    } catch (err) {
      setResult({ text: 'Terjadi kesalahan koneksi.', type: 'error' });
      setTimeout(() => setResult(null), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Inisialisasi Scanner
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (html5QrCodeRef.current) return;

    const scanner = new Html5Qrcode(scannerId);
    html5QrCodeRef.current = scanner;

    const startScanning = async () => {
      setCameraPermission('prompting');
      setErrorMessage('');
      
      try {
        const devices = await Html5Qrcode.getCameras();
        
        if (devices.length === 0) {
          throw new Error('Tidak ada kamera ditemukan di perangkat ini.');
        }

        // Pilih kamera belakang (Rear/Environment) secara otomatis
        const backCamera = devices.find(d => d.label?.toLowerCase().includes('back') || d.label?.toLowerCase().includes('environment'));
        const selectedCamera = backCamera || devices[0];

        await scanner.start(
          selectedCamera.id, 
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, 
          (decodedText) => {
            if (!isProcessing) handleProcessScan(decodedText);
          },
          undefined
        );
        
        setIsScanning(true);
        setCameraPermission('granted');
      } catch (err: any) {
        setIsScanning(false);
        setCameraPermission('denied');
        
        let msg = 'Gagal mengakses kamera.';
        if (err.name === 'NotAllowedError') msg = 'Izin akses kamera ditolak. Mohon periksa pengaturan browser.';
        else if (err.name === 'NotFoundError') msg = 'Kamera tidak ditemukan.';
        else if (err.name === 'NotSupportedError') msg = 'Browser tidak mendukung akses kamera.';
        
        setErrorMessage(msg);
      }
    };

    setTimeout(() => { startScanning(); }, 500);

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Manual Test Button
  const handleTestScan = () => {
    handleProcessScan('AGENDA-TEST-123');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center">
          <h1 className="text-white text-xl font-bold tracking-tight">Scan Absensi</h1>
          <p className="text-blue-100 text-sm mt-1">Arahkan QR Code ke kamera</p>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Scanner Area */}
          <div className="relative aspect-square bg-black rounded-xl overflow-hidden shadow-inner ring-4 ring-gray-100">
            {/* Scanner Container */}
            <div id={scannerId} className="w-full h-full object-cover"></div>
            
            {/* Overlay Loading */}
            {cameraPermission === 'prompting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                <div className="text-center text-white space-y-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-white mx-auto"></div>
                  <p className="text-sm">Menginisialisasi Kamera...</p>
                </div>
              </div>
            )}

            {/* Overlay Error */}
            {cameraPermission === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 p-6 text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-video-slash text-white text-xl"></i>
                </div>
                <h3 className="text-white font-bold mb-2">Akses Kamera Ditolak</h3>
                <p className="text-gray-300 text-sm mb-4">{errorMessage}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white text-blue-600 rounded-lg font-semibold text-sm">
                  Coba Lagi
                </button>
              </div>
            )}

            {/* Overlay Scanner Corners (Visible when active) */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
                <div className="w-48 h-48 border-2 border-white/30 relative">
                  {/* Corners */}
                  <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg"></div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg"></div>
                  <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg"></div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg"></div>
                  
                  {/* Scan Line Animation */}
                  <div className="absolute w-full h-0.5 bg-blue-400/50 top-1/2 animate-[scan_2s_linear_infinite]"></div>
                </div>
              </div>
            )}

            {/* Scanning Indicator */}
            {isScanning && !cameraPermission && (
               <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                 Kamera Aktif
               </div>
            )}
          </div>

          {/* Status Message */}
          {result && (
            <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
              result.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                result.type === 'success' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`fas ${result.type === 'success' ? 'fa-check' : 'fa-times'}`}></i>
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">{result.type === 'success' ? 'Berhasil' : 'Gagal'}</p>
                <p className="text-xs opacity-90">{result.text}</p>
              </div>
            </div>
          )}

          {/* Manual Test */}
          <div className="border-t border-gray-100 pt-6">
             <p className="text-xs text-gray-400 text-center mb-3">Mode Uji Coba (Tanpa QR)</p>
             <button onClick={handleTestScan} disabled={isProcessing} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg text-sm font-semibold transition">
                🧪 Tes Scan Manual (AGENDA-TEST-123)
             </button>
          </div>

          {/* Debug Info (Collapsible) */}
          <details className="text-xs text-gray-400">
            <summary 
              onClick={() => setShowDebug(!showDebug)}
              className="cursor-pointer hover:text-gray-600 font-semibold mb-2 select-none"
            >
              {showDebug ? 'Sembunyikan' : 'Lihat'} Informasi Teknis
            </summary>
            {showDebug && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg font-mono text-[10px]">
                <p>Status: {isScanning ? 'Scanning' : 'Idle'}</p>
                <p>Permission: {cameraPermission}</p>
                <p>Scan Count: {scanCountRef.current}</p>
                <p>API: {apiUrl('/api/attendance/scan')}</p>
                <p>Library: html5-qrcode</p>
              </div>
            )}
          </details>

        </div>
      </div>
      
      {/* Animasi CSS untuk Scan Line */}
      <style>{`
        @keyframes scan_2s_linear {
            0% { transform: translateY(-100%); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(200%); opacity: 0; }
        }
        .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}