interface ProgressBarProps {
  value: number;
  label?: string;
  showValue?: boolean;
}

export default function ProgressBar({ value, label, showValue = true }: ProgressBarProps) {
  const safeValue = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1.5">
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-[#4B5870]">
          <span>{label}</span>
          {showValue && <span className="font-bold text-[#172033]">{safeValue}%</span>}
        </div>
      )}
      <div 
        className="h-2 overflow-hidden rounded-full bg-[#EEF4FB] border border-[#EAF0F6]" 
        role="progressbar" 
        aria-valuenow={safeValue} 
        aria-valuemin={0} 
        aria-valuemax={100} 
        aria-label={label || 'Progress'}
      >
        <div 
          className="h-full rounded-full bg-[#2F6FED] transition-all duration-300" 
          style={{ width: `${safeValue}%` }} 
        />
      </div>
    </div>
  );
}
