const APP_URL = (import.meta.env.VITE_APP_URL || '').replace(/\/$/, '');

export function isAppSubdomain(): boolean {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname.toLowerCase();
    return hostname.startsWith('studyzen-app') || hostname.startsWith('app.studyzen');
}

export function isLandingSubdomain(): boolean {
    if (typeof window === 'undefined') return false;
    const hostname = window.location.hostname.toLowerCase();
    return (hostname === 'studyzen.frandm.dev' || hostname.startsWith('studyzen.')) && !isAppSubdomain();
}

export function getAppUrl(path = '/timer'): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (typeof window !== 'undefined' && isAppSubdomain()) {
        return cleanPath;
    }
    if (APP_URL) {
        return `${APP_URL}${cleanPath}`;
    }
    if (typeof window !== 'undefined' && isLandingSubdomain()) {
        return `https://studyzen-app.frandm.dev${cleanPath}`;
    }
    return cleanPath;
}
