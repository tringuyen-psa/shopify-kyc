/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Router is now stable, no need for experimental flag
  // Exclude demo directory from build
  experimental: {
    outputFileTracingExcludes: {
      '*': ['./stripe-connect-furever-demo/**/*'],
    },
  },
}

module.exports = nextConfig