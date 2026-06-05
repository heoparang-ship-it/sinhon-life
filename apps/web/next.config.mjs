const nextConfig = {
  async redirects() {
    return [
      {
        destination: "/policies",
        permanent: false,
        source: "/budget"
      },
      {
        destination: "/policies",
        permanent: false,
        source: "/ai"
      },
      {
        destination: "/",
        permanent: false,
        source: "/support"
      },
      {
        destination: "/archive",
        permanent: false,
        source: "/cheongmo"
      }
    ];
  },
  transpilePackages: ["@sinhon-os/config", "@sinhon-os/ui"]
};

export default nextConfig;
