import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { env } from '@/config/env';

interface LivePreviewModalProps {
 isOpen: boolean;
 onClose: () => void;
 contentType: string;
 data: any;
}

const fileToBase64 = (file: File): Promise<string> => {
 return new Promise((resolve) => {
 const reader = new FileReader();
 reader.onloadend = () => resolve(reader.result as string);
 reader.readAsDataURL(file);
 });
};

export const LivePreviewModal: React.FC<LivePreviewModalProps> = ({
 isOpen,
 onClose,
 contentType,
 data,
}) => {
 const iframeRef = useRef<HTMLIFrameElement>(null);
 const [iframeReady, setIframeReady] = useState(false);
 const [processedData, setProcessedData] = useState<any>(null);

 useEffect(() => {
 let isMounted = true;
 const processData = async () => {
 if (!data) return;
 const newData = { ...data };
 
 if (newData.cover_image instanceof File) {
 newData.cover_image = await fileToBase64(newData.cover_image);
 }
 if (newData.client_logo instanceof File) {
 newData.client_logo = await fileToBase64(newData.client_logo);
 }
 if (Array.isArray(newData.gallery)) {
 newData.gallery = await Promise.all(
 newData.gallery.map(async (item: any) => {
 if (item instanceof File) return await fileToBase64(item);
 return item;
 })
 );
 }
 
 if (isMounted) {
 setProcessedData(newData);
 }
 };
 
 processData();
 return () => { isMounted = false; };
 }, [data]);

 // Helper to send the current form state to the iframe
 const sendPreviewUpdate = useCallback(() => {
 if (iframeRef.current?.contentWindow && processedData) {
 console.log("[React Admin] Sending LIVE_PREVIEW_UPDATE", { contentType, data: processedData });
 iframeRef.current.contentWindow.postMessage(
 {
 type: 'LIVE_PREVIEW_UPDATE',
 content_type: contentType,
 data: processedData,
 },
 new URL(env.frontendUrl).origin
 );
 }
 }, [contentType, processedData]);

 // 1. Listen for PREVIEW_READY from the Nuxt iframe
 useEffect(() => {
 if (!isOpen) return;

 const handleMessage = (event: MessageEvent) => {
 try {
 const allowedOrigin = new URL(env.frontendUrl).origin;
 if (event.origin !== allowedOrigin) return;
 } catch (_e) {
 return; // Handle invalid URLs safely
 }

 if (event.data?.type === 'PREVIEW_READY') {
 console.log("[React Admin] Received PREVIEW_READY from iframe. Dispatched payload.");
 setIframeReady(true);
 // Force send data IMMEDIATELY on every PREVIEW_READY to survive Nuxt HMR
 sendPreviewUpdate();
 }
 };

 window.addEventListener('message', handleMessage);
 return () => {
 window.removeEventListener('message', handleMessage);
 setIframeReady(false); // Reset readiness when closing modal
 };
 }, [isOpen, sendPreviewUpdate]);

 // 2. Send LIVE_PREVIEW_UPDATE whenever form data changes, ONLY if iframe is already ready
 useEffect(() => {
 if (isOpen && iframeReady) {
 sendPreviewUpdate();
 }
 }, [isOpen, iframeReady, data, contentType, sendPreviewUpdate]);

 if (!isOpen) return null;

 return createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md">
 <div className="flex flex-col w-[95vw] h-[95vh] bg-white rounded-xl shadow-2xl overflow-hidden relative z-10">
 {/* Header */}
 <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
 <div className="flex items-center space-x-3">
 <h3 className="text-lg font-semibold text-foreground">Live Preview</h3>
 <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-info text-info-foreground">
 {contentType.toUpperCase()}
 </span>
 <span className="flex h-2 w-2 relative ml-2">
 <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${iframeReady ? 'bg-success animate-ping' : 'bg-warning animate-pulse'}`}></span>
 <span className={`relative inline-flex rounded-full h-2 w-2 ${iframeReady ? 'bg-success' : 'bg-warning'}`}></span>
 </span>
 <span className="text-xs text-muted-foreground">
 {iframeReady ? 'Auto-sync active' : 'Waiting for connection...'}
 </span>
 </div>
 <button
 onClick={onClose}
 className="p-2 text-muted-foreground hover:text-gray-600 hover:bg-white rounded-lg transition-colors"
 >
 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Iframe Container */}
 <div className="flex-1 bg-white relative">
 {!iframeReady && (
 <div className="absolute inset-0 flex items-center justify-center">
 <div className="flex flex-col items-center space-y-4">
 <div className="animate-spin rounded-full h-10 w-10 border-4 border-info/30 border-t-transparent"></div>
 <p className="text-sm text-muted-foreground font-medium">Connecting to Preview Server...</p>
 </div>
 </div>
 )}
 <iframe
 ref={iframeRef}
 src={`${env.frontendUrl}/preview/live`}
 className={`w-full h-full border-0 transition-opacity duration-300 ${
 iframeReady ? 'opacity-100' : 'opacity-0'
 }`}
 title="Live Preview"
 />
 </div>
 </div>
 </div>,
 document.body
 );
};
