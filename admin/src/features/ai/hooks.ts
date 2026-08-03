import { useMutation } from '@tanstack/react-query';
import { generateDraft } from './api';

export const useGenerateDraft = () => {
 return useMutation({
 mutationFn: generateDraft,
 });
};
