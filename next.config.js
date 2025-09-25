/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 14
  output: 'standalone',
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig
