import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Terminal } from 'lucide-react';

const GITHUB_URL = 'https://github.com/frandm16/StudyZen';

const LINES = [
    'git clone https://github.com/frandm16/StudyZen.git',
    'cd StudyZen',
    'cp .env.example .env',
    '# edit .env: set DB_PASSWORD and JWT_SECRET',
    'docker compose up -d --build',
];

const STEPS = [
    {
        title: 'Get the code',
        text: 'Clone the repository and copy the example environment file.',
    },
    {
        title: 'Set your secrets',
        text: 'Choose a database password and a JWT_SECRET of at least 32 characters.',
    },
    {
        title: 'Start it',
        text: 'Docker builds the frontend, backend and database. Then open localhost:7777.',
    },
];

export function LandingSelfHost() {
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return;
        const id = window.setTimeout(() => setCopied(false), 2000);
        return () => window.clearTimeout(id);
    }, [copied]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(LINES.join('\n'));
            setCopied(true);
        } catch {
            // Clipboard API unavailable (e.g. insecure context): the text stays selectable.
        }
    };

    return (
        <section
            id="self-host"
            aria-labelledby="self-host-title"
            className="w-full scroll-mt-24 border-t border-[var(--app-border)] py-16 sm:py-24"
        >
            <div className="mx-auto max-w-7xl">
                <div className="max-w-3xl">
                    <h2
                        id="self-host-title"
                        className="text-3xl font-extrabold tracking-tight text-[var(--app-text)] sm:text-4xl"
                    >
                        Run it on your own server
                    </h2>
                    <p className="mt-3 text-base text-[var(--app-text-muted)]">
                        StudyZen is open source. With Docker installed, you can have your own copy running in a few minutes.
                    </p>
                </div>

                <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-start">
                    <ol className="flex flex-col gap-5">
                        {STEPS.map((step, index) => (
                            <li key={step.title} className="flex gap-4">
                                <span
                                    aria-hidden="true"
                                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent-color)] text-sm font-bold text-[var(--accent-color)]"
                                >
                                    {index + 1}
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-[var(--app-text)]">{step.title}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-[var(--app-text-muted)]">{step.text}</p>
                                </div>
                            </li>
                        ))}

                        <li>
                            <a
                                href={`${GITHUB_URL}#quickstart-with-docker-compose`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-[var(--accent-color)] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                            >
                                Read the full setup guide
                                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                                <span className="sr-only">(opens in a new tab)</span>
                            </a>
                        </li>
                    </ol>

                    <div className="overflow-hidden rounded-2xl border border-[var(--app-border)] bg-[var(--app-card-bg)] shadow-lg">
                        <div className="flex h-11 items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-bg)]/60 pr-2 pl-4">
                            <div className="flex items-center gap-2 text-xs text-[var(--app-text-muted)]">
                                <Terminal className="h-3.5 w-3.5" aria-hidden="true" />
                                <span className="font-mono text-[11px]">bash</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[var(--app-text-muted)] transition-colors hover:bg-[var(--app-card-bg)] hover:text-[var(--app-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
                            >
                                {copied ? (
                                    <Check className="h-3.5 w-3.5 text-[var(--accent-color)]" aria-hidden="true" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                                )}
                                {copied ? 'Copied' : 'Copy commands'}
                            </button>
                        </div>

                        <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-7 text-[var(--app-text)]">
                            <code>
                                {LINES.map((line) =>
                                    line.startsWith('#') ? (
                                        <span key={line} className="block text-[var(--app-text-muted)]">
                                            {line}
                                        </span>
                                    ) : (
                                        <span key={line} className="block">
                                            <span aria-hidden="true" className="mr-2 select-none text-[var(--accent-color)]">
                                                $
                                            </span>
                                            {line}
                                        </span>
                                    ),
                                )}
                            </code>
                        </pre>
                        <p className="sr-only" role="status" aria-live="polite">
                            {copied ? 'Commands copied to clipboard' : ''}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}