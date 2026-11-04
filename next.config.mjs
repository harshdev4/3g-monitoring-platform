/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["compress-pdf"],
  outputFileTracingIncludes: {
    "/api/students/actions/*/submit": ["node_modules/compress-pdf/bin/gs/**/*"],
  },
};

export default nextConfig;
