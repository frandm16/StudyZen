import { Link } from 'react-router-dom';

export function LandingPage() {
    return (
        <main className="flex min-h-full items-center justify-center bg-red-600 px-6 text-center text-white">
            <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Landing Page</h1>
                <Link
                    to="/timer"
                    className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-white/70 px-6 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                    Open the app
                </Link>
            </div>
        </main>
    );
}
