import { createContext, useContext, useState, type ReactNode } from 'react';

interface ClockContextType {
    isOpen: boolean;
    openClock: () => void;
    closeClock: () => void;
    toggleClock: () => void;
}

const ClockContext = createContext<ClockContextType | null>(null);

export function ClockProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const openClock = () => setIsOpen(true);
    const closeClock = () => setIsOpen(false);
    const toggleClock = () => setIsOpen((prev) => !prev);

    return (
        <ClockContext.Provider value={{ isOpen, openClock, closeClock, toggleClock }}>
            {children}
        </ClockContext.Provider>
    );
}

export function useClock() {
    const context = useContext(ClockContext);
    if (!context) {
        throw new Error('useClock must be used within a ClockProvider');
    }
    return context;
}
