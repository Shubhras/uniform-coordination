import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    transpilePackages: ['three', '@react-three/drei', '@react-three/fiber'],
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    },
};

export default withNextIntl(nextConfig);
