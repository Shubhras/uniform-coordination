import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

// Sent on every response. Kept to policies that cannot break the app (no script-src),
// so they can stay on even for demos: no clickjacking, no MIME sniffing, no plugins,
// no <base> hijacking, forms only post to our own origin, HTTPS remembered by browsers.
const securityHeaders = [
    { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'",
    },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Don't advertise the framework/version to scanners.
    poweredByHeader: false,
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }];
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    transpilePackages: ['three', '@react-three/drei', '@react-three/fiber'],
};

export default withNextIntl(nextConfig);