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
                "relative flex w-full items-center rounded-full bg-neutral-100 p-1",
                className,
            ].join(" ")}
        >
            <span
                aria-hidden="true"
                className="
                    pointer-events-none absolute inset-y-0
                    rounded-full bg-white
                    shadow-[0_1px_3px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]
                    transition-[transform,width]
                    duration-500
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
                            "relative cursor-pointer z-10 flex-1 rounded-full text-sm",
                            "transition-colors duration-300",
                            "motion-reduce:transition-none",
                            "disabled:cursor-default disabled:opacity-60",
                            optionClassName,
                            focusRing,
                            active
                                ? "font-medium text-[#151414]"
                                : "text-neutral-500 enabled:hover:text-[#151414]",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};