import { toast } from 'react-hot-toast';
import { createResource } from '@/features/resources/api';
import type { ContentType } from '@/features/resources/types';

export async function uploadPendingResources(
 pendingResources: File[],
 contentType: ContentType,
 contentId: number
) {
 if (pendingResources.length === 0) return { successCount: 0, failCount: 0 };

 toast.loading(`Uploading resources (0 / ${pendingResources.length})...`, { id: 'upload-toast' });
 let finishedCount = 0;

 const results = await Promise.allSettled(
 pendingResources.map(async (file) => {
 try {
 const res = await createResource({ contentType, contentId, file });
 console.log('UPLOAD RES:', res);
 finishedCount++;
 toast.loading(`Uploading resources (${finishedCount} / ${pendingResources.length})...`, { id: 'upload-toast' });
 return res;
 } catch (err: any) {
 console.error('UPLOAD ERR:', err, err?.response?.data);
 finishedCount++;
 toast.loading(`Uploading resources (${finishedCount} / ${pendingResources.length})...`, { id: 'upload-toast' });
 throw err;
 }
 })
 );

 toast.dismiss('upload-toast');

 let successCount = 0;
 let failCount = 0;
 results.forEach(res => {
 if (res.status === 'fulfilled') successCount++;
 else failCount++;
 });

 return { successCount, failCount };
}
