import { useEffect, useRef, useState } from "react";

interface SegmentedOption<T extends string> {
    value: T;
    label: string;
}

interface SegmentedControlProps<T extends string> {
    options: readonly SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    disabled?: boolean;
    ariaLabel: string;
    focusRing?: string;
    className?: string;
    optionClassName?: string;
}

interface PillState {
    width: number;
    x: number;
}

export const SegmentedControl = <T extends string>({
    options,
    value,
    onChange,
    disabled = false,
    ariaLabel,
    focusRing = "",
    className = "",
    optionClassName = "px-3 py-1.5",
}: SegmentedControlProps<T>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const [pill, setPill] = useState<PillState>({
        width: 0,
        x: 0,
    });

    useEffect(() => {
        const updatePill = () => {
            const container = containerRef.current;
            const activeItem = itemRefs.current[value];

            if (!container || !activeItem) return;

            const containerRect = container.getBoundingClientRect();
            const itemRect = activeItem.getBoundingClientRect();

            setPill({
                width: itemRect.width,
                x: itemRect.left - containerRect.left - 4,
            });
        };

        updatePill();

        const resizeObserver = new ResizeObserver(updatePill);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        Object.values(itemRefs.current).forEach((element) => {
            if (element) {
                resizeObserver.observe(element);
            }
        });

        window.addEventListener("resize", updatePill);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("resize", updatePill);
        };
    }, [value, options]);

    return (
        <div
            ref={containerRef}
            role="radiogroup"
            aria-label={ariaLabel}
            className={[
                "relative flex w-full items-center rounded-full bg-neutral-500/10 border border-[var(--app-border)] p-1",
                className,
            ].join(" ")}
        >
            <span
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-y-1
                    rounded-full bg-[var(--app-card-bg)] border border-[var(--app-border)]
                    shadow-sm
                    transition-[transform,width]
                    duration-300
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    motion-reduce:transition-none
                "
                style={{
                    width: pill.width,
                    transform: `translateX(${pill.x}px)`,
                }}
            />

            {options.map(({ value: optionValue, label }) => {
                const active = value === optionValue;

                return (
                    <button
                        key={optionValue}
                        ref={(element) => {
                            itemRefs.current[optionValue] = element;
                        }}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        disabled={disabled}
                        onClick={() => onChange(optionValue)}
                        className={[
                            "relative cursor-pointer z-10 flex-1 rounded-full text-xs font-semibold",
                            "transition-colors duration-200",
                            "motion-reduce:transition-none",
                            "disabled:cursor-default disabled:opacity-40",
                            optionClassName,
                            focusRing,
                            active
                                ? "font-bold text-[var(--accent-color)]"
                                : "text-[var(--app-text-muted)] enabled:hover:text-[var(--app-text)]",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};