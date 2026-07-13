import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = { transpilePackages: ['three', '@react-three/drei', '@react-three/fiber'],};

export default withNextIntl(nextConfig);
