import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useGenerateDraft } from './hooks';
import type { GenerateContentRequest } from './types';
import { FormField } from '@/components/form/FormField';
import { FormTextarea } from '@/components/form/FormTextarea';

interface GenerateDraftModalProps {
 isOpen: boolean;
 onClose: () => void;
 contentType: GenerateContentRequest['content_type'];
 onApply: (generated: any) => void;
}

const PRESETS = [
 { id: 'quick_draft', label: 'Quick Draft' },
 { id: 'seo_optimized', label: 'SEO Optimized' },
 { id: 'thought_leadership', label: 'Thought Leadership' },
 { id: 'technical_article', label: 'Technical Article' },
 { id: 'marketing_copy', label: 'Marketing Copy' },
];

export function GenerateDraftModal({ isOpen, onClose, contentType, onApply }: GenerateDraftModalProps) {
 const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<GenerateContentRequest>({
 defaultValues: {
 content_type: contentType,
 tone: 'Professional',
 length: 'Medium',
 }
 });

 const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
 const generateMutation = useGenerateDraft();

 if (!isOpen) return null;

 const onSubmit = async (data: GenerateContentRequest) => {
 // Convert comma string to array for keywords
 const payload = {
 ...data,
 keywords: typeof data.keywords === 'string' && data.keywords ? (data.keywords as string).split(',').map(k => k.trim()).filter(Boolean) : undefined,
 };
 
 try {
 const response = await generateMutation.mutateAsync(payload);
 onApply(response.generated);
 toast.success('Draft generated successfully!');
 // Note: intentionally not closing the modal so they can "Generate Again" if they want
 } catch (err: any) {
 toast.error(err?.response?.data?.detail || 'Failed to generate content. Please try again.');
 }
 };

 const handleClose = () => {
 reset();
 generateMutation.reset();
 onClose();
 };

 return createPortal(
 <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
 <div className="w-full max-w-2xl rounded-2xl border border-border bg-background p-6 shadow-2xl my-auto relative z-10">
 <div className="flex items-center justify-between mb-6">
 <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
 ✨ Generate with AI
 </h2>
 <button
 onClick={handleClose}
 className="text-muted-foreground hover:text-foreground transition-colors"
 >
 <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
 {/* Presets */}
 <div>
 <label className="block text-sm font-medium text-foreground mb-2">Style Preset</label>
 <div className="flex flex-wrap gap-2">
 {PRESETS.map((preset) => (
 <button
 key={preset.id}
 type="button"
 onClick={() => setValue('preset', preset.id)}
 className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
 watch('preset') === preset.id
 ? 'bg-primary text-secondary'
 : 'bg-input text-muted-foreground border border-border hover:border-primary/50 hover:text-foreground'
 }`}
 >
 {preset.label}
 </button>
 ))}
 {watch('preset') && (
 <button
 type="button"
 onClick={() => setValue('preset', undefined)}
 className="px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground"
 >
 Clear
 </button>
 )}
 </div>
 </div>

 <div className="grid grid-cols-1 gap-5">
 <FormField
 label="Topic"
 required
 placeholder="What should this content be about?"
 maxLength={200}
 error={errors.topic}
 {...register('topic', { required: 'Topic is required', maxLength: 200 })}
 />
 
 <FormField
 label="Keywords (comma separated)"
 placeholder="AI, CMS, branding"
 {...register('keywords')}
 />
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <FormField
 label="Audience"
 placeholder="e.g. Developers"
 maxLength={200}
 {...register('audience', { maxLength: 200 })}
 />
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Tone</label>
 <select 
 className="w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
 {...register('tone')}
 >
 <option value="Professional">Professional</option>
 <option value="Technical">Technical</option>
 <option value="Educational">Educational</option>
 <option value="Corporate">Corporate</option>
 <option value="Marketing">Marketing</option>
 <option value="Friendly">Friendly</option>
 <option value="Conversational">Conversational</option>
 <option value="Executive">Executive</option>
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Length</label>
 <select 
 className="w-full rounded-lg border border-border bg-input/50 px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
 {...register('length')}
 >
 <option value="Short">Short</option>
 <option value="Medium">Medium</option>
 <option value="Long">Long</option>
 </select>
 </div>
 </div>
 </div>

 {/* Advanced Options Toggle */}
 <div>
 <button
 type="button"
 onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
 className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
 >
 <span>Advanced Options</span>
 <svg 
 className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`} 
 fill="none" 
 viewBox="0 0 24 24" 
 stroke="currentColor"
 >
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
 </svg>
 </button>
 
 {isAdvancedOpen && (
 <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-input/50 border border-border rounded-lg">
 <FormField
 label="Language"
 placeholder="e.g. English"
 {...register('language')}
 />
 
 <div>
 <label className="block text-sm font-medium text-foreground mb-1.5">Goal</label>
 <select 
 className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
 {...register('goal')}
 >
 <option value="">(None)</option>
 <option value="Educate">Educate</option>
 <option value="Lead Generation">Lead Generation</option>
 <option value="Brand Awareness">Brand Awareness</option>
 <option value="Product Promotion">Product Promotion</option>
 <option value="Thought Leadership">Thought Leadership</option>
 <option value="Case Study Showcase">Case Study Showcase</option>
 <option value="Customer Success Story">Customer Success Story</option>
 </select>
 </div>
 
 <div className="md:col-span-2">
 <FormField
 label="Call to Action (CTA)"
 placeholder="e.g. Book a Demo"
 maxLength={500}
 {...register('cta', { maxLength: 500 })}
 />
 </div>
 
 <div className="md:col-span-2">
 <FormTextarea
 label="Custom Instructions"
 placeholder="Any specific instructions for the AI..."
 rows={3}
 maxLength={2000}
 {...register('custom_instructions', { maxLength: 2000 })}
 />
 </div>
 </div>
 )}
 </div>

 <div className="flex justify-end gap-3 mt-4 border-t border-border pt-6">
 <button
 type="button"
 onClick={handleClose}
 className="px-4 py-2 text-sm font-medium text-foreground hover:text-foreground transition-colors"
 >
 Cancel
 </button>
 <button
 type="submit"
 disabled={generateMutation.isPending}
 className="interactive-button-small"
 >
 {generateMutation.isPending ? (
 <span className="label flex items-center gap-2">
 <svg className="animate-spin h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 Generating...
 </span>
 ) : generateMutation.isSuccess ? (
 <>
 <span className="label">✨ Generate Again</span>
 <div className="icon"></div>
 </>
 ) : (
 <>
 <span className="label">✨ Generate</span>
 <div className="icon"></div>
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>,
 document.body
 );
}
