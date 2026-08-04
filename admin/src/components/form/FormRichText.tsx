import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { cn } from '@/utils/utils';
import { forwardRef } from 'react';


export interface FormRichTextProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange'> {
  label: string;
  error?: { message?: string };
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'blockquote', 'code-block'],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'blockquote', 'code-block'
];

export const FormRichText = forwardRef<ReactQuill, FormRichTextProps>(
  ({ label, error, required, value, onChange, className, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        <label className="text-sm font-semibold text-foreground">
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </label>
        <div className="relative">
          <ReactQuill
            ref={ref}
            theme="snow"
            value={value || ''}
            onChange={(content, _delta, source) => {
              if (source === 'api') return;
              const isActuallyEmpty = content === '<p><br></p>' || content === '<div><br></div>' || content === '';
              onChange(isActuallyEmpty ? '' : content);
            }}
            modules={modules}
            formats={formats}
            className={cn(
              'o2-rich-text [&_.ql-toolbar]:border-border [&_.ql-toolbar]:bg-muted/50 [&_.ql-toolbar]:rounded-t-lg',
              '[&_.ql-container]:border-border [&_.ql-container]:rounded-b-lg [&_.ql-editor]:min-h-[250px] [&_.ql-editor]:text-base [&_.ql-editor]:text-foreground',
              error && '[&_.ql-toolbar]:border-destructive [&_.ql-container]:border-destructive'
            )}
            // We pass other props (like placeholder if supported) through standard ReactQuill props
            placeholder={props.placeholder}
          />
        </div>
        {error?.message && (
          <p className="text-sm text-destructive">{error.message}</p>
        )}
      </div>
    );
  }
);

FormRichText.displayName = 'FormRichText';
