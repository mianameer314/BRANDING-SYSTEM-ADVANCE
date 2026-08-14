import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/utils/utils';

interface OtpInputProps {
    length?: number;
    onComplete: (otp: string) => void;
    onChange?: (otp: string) => void;
    hasError?: boolean;
    disabled?: boolean;
}

export function OtpInput({ length = 6, onComplete, onChange, hasError, disabled }: OtpInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        // Auto focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newOtp = [...otp];
        // Take the last character in case they type fast or paste partially
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        const otpString = newOtp.join('');
        if (onChange) onChange(otpString);

        // Move to next input
        if (value && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }

        // Complete
        if (otpString.length === length && !newOtp.includes('')) {
            onComplete(otpString);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            // Move back and clear
            const newOtp = [...otp];
            newOtp[index - 1] = '';
            setOtp(newOtp);
            inputRefs.current[index - 1]?.focus();
            if (onChange) onChange(newOtp.join(''));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length).replace(/\D/g, '');
        if (pastedData) {
            const newOtp = [...otp];
            for (let i = 0; i < pastedData.length; i++) {
                newOtp[i] = pastedData[i];
            }
            setOtp(newOtp);
            const otpString = newOtp.join('');
            if (onChange) onChange(otpString);

            if (pastedData.length < length) {
                inputRefs.current[pastedData.length]?.focus();
            } else {
                inputRefs.current[length - 1]?.focus();
                if (!newOtp.includes('')) {
                    onComplete(otpString);
                }
            }
        }
    };

    return (
        <div className="flex gap-2 justify-between" onPaste={handlePaste}>
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={disabled}
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className={cn(
                        "w-12 h-14 text-center text-xl font-bold rounded-lg border-2 bg-slate-900 transition-all duration-300",
                        "focus:outline-none focus:ring-2 focus:ring-o2-green/50",
                        digit ? "border-o2-green text-o2-green" : "border-slate-700 text-slate-300",
                        hasError && "border-red-500 text-red-500 focus:ring-red-500/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                />
            ))}
        </div>
    );
}
