/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:5001/api/users/:path*',
      },
      {
        source: '/api/roles/:path*',
        destination: 'http://localhost:5001/api/roles/:path*',
      },
      {
        source: '/api/projects/:path*',
        destination: 'http://localhost:5001/api/projects/:path*',
      },
      {
        source: '/api/time-records/:path*',
        destination: 'http://localhost:5001/api/time-records/:path*',
      },
      {
        source: '/api/reports/:path*',
        destination: 'http://localhost:5001/api/reports/:path*',
      },
      {
        source: '/api/costs/:path*',
        destination: 'http://localhost:5001/api/costs/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: 'http://localhost:5001/api/auth/:path*',
      },
    ];
  },
  // 禁用自动重定向
  trailingSlash: false,
}

module.exports = nextConfig 