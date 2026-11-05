interface SubjectChipProps {
    name?: string;
    color?: string;
    className?: string;
}

export function SubjectChip({ name, color, className = '' }: SubjectChipProps) {
    if (!name) return null;
    const c = color || 'var(--accent-color)';
    return (
        <span
            className={`inline-flex items-center gap-1.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-black/35 text-white/95 border border-white/15 shadow-xs ${className}`}
        >
            <span
                className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-white/30"
                style={{ backgroundColor: c }}
                aria-hidden="true"
            />
            <span className="truncate max-w-[90px]">{name}</span>
        </span>
    );
}
