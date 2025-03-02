/** @type {import('next').NextConfig} */
const nextConfig = {
    devIndicators: false,
    async redirects() {
        return [
            {
                source: "/",
                destination: "/login",
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
