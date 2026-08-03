/**
 * MetricsEditor — dynamic list of {label, value} KPI metrics.
 * Used exclusively by the Case Study form.
 *
 * Backend: metrics: str | None = Form(None, description='JSON array of {label,value} objects')
 * Wire format: JSON.stringify([{label: "...", value: "..."}])
 */
import { Plus, Trash2 } from 'lucide-react';
import type { MetricItem } from '@/features/shared/forms/schemas';

interface MetricsEditorProps {
 value: MetricItem[];
 onChange: (metrics: MetricItem[]) => void;
 disabled?: boolean;
}

export function MetricsEditor({ value, onChange, disabled = false }: MetricsEditorProps) {
 const addMetric = () => {
 onChange([...value, { label: '', value: '' }]);
 };

 const updateMetric = (index: number, field: keyof MetricItem, text: string) => {
 const updated = value.map((m, i) => (i === index ? { ...m, [field]: text } : m));
 onChange(updated);
 };

 const removeMetric = (index: number) => {
 onChange(value.filter((_, i) => i !== index));
 };

 return (
 <div className="flex flex-col gap-3">
 <div className="flex items-center justify-between">
 <label className="text-sm font-medium text-foreground">Metrics</label>
 {!disabled && (
 <button
 type="button"
 onClick={addMetric}
 className="flex items-center gap-1 text-xs font-semibold text-secondary hover:text-primary transition-colors bg-accent px-2 py-1 rounded-md border border-border"
 >
 <Plus size={14} />
 Add metric
 </button>
 )}
 </div>

 {value.length === 0 && (
 <p className="text-xs text-muted-foreground">No metrics added. Click "Add metric" to add KPIs.</p>
 )}

 <div className="flex flex-col gap-2">
 {value.map((metric, index) => (
 <div key={index} className="flex gap-2 items-start">
 <input
 type="text"
 placeholder="Label (e.g. Revenue Increase)"
 value={metric.label}
 onChange={(e) => updateMetric(index, 'label', e.target.value)}
 disabled={disabled}
 className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
 />
 <input
 type="text"
 placeholder="Value (e.g. 40%)"
 value={metric.value}
 onChange={(e) => updateMetric(index, 'value', e.target.value)}
 disabled={disabled}
 className="w-32 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
 />
 {!disabled && (
 <button
 type="button"
 onClick={() => removeMetric(index)}
 className="mt-2 text-muted-foreground hover:text-destructive transition-colors"
 title="Remove metric"
 >
 <Trash2 size={16} />
 </button>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}
