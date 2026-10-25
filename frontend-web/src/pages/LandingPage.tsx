import { LandingHeader } from '../components/landing/LandingHeader';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingGallery } from '../components/landing/LandingGallery';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingClosingCta } from '../components/landing/LandingClosingCta';
import { LandingFooter } from '../components/landing/LandingFooter';

export function LandingPage() {
    return (
        <div className="relative min-h-full w-full select-text bg-[var(--app-bg)] text-[var(--app-text)] transition-colors duration-200">
            <LandingHeader />
            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
                <LandingHero />
                <LandingGallery />
                <LandingFeatures />
                <LandingClosingCta />
            </main>
            <LandingFooter />
        </div>
    );
}

export default LandingPage;
