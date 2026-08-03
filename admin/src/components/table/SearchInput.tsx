import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
 value?: string;
 onChange: (value: string) => void;
 placeholder?: string;
 debounceMs?: number;
}

export const SearchInput = ({ 
 value = '', 
 onChange, 
 placeholder = 'Search...', 
 debounceMs = 500 
}: SearchInputProps) => {
 const [localValue, setLocalValue] = useState(value);

 // Sync prop changes down
 useEffect(() => {
 setLocalValue(value || '');
 }, [value]);

 // Debounce logic
 useEffect(() => {
 const handler = setTimeout(() => {
 if (localValue !== value) {
 onChange(localValue);
 }
 }, debounceMs);

 return () => {
 clearTimeout(handler);
 };
 }, [localValue, onChange, debounceMs, value]);

 const handleClear = () => {
 setLocalValue('');
 onChange('');
 };

 return (
 <div className="relative flex items-center w-full max-w-sm">
 <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
 <input
 type="text"
 className="w-full pl-9 pr-9 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all "
 placeholder={placeholder}
 value={localValue}
 onChange={(e) => setLocalValue(e.target.value)}
 />
 {localValue && (
 <button
 type="button"
 onClick={handleClear}
 className="absolute right-3 p-1 rounded-full text-muted-foreground hover:text-slate-600 hover:bg-slate-100 transition-colors"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 </div>
 );
};
