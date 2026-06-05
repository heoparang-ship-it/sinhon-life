const nextConfig = {
  async redirects() {
    return [
      {
        destination: "/calculators",
        permanent: false,
        source: "/budget"
      },
      {
        destination: "/policies",
        permanent: false,
        source: "/ai"
      },
      {
        destination: "/articles",
        permanent: false,
        source: "/archive"
      },
      {
        destination: "/signup",
        permanent: false,
        source: "/support"
      },
      {
        destination: "/articles",
        permanent: false,
        source: "/cheongmo"
      }
    ];
  },
  transpilePackages: ["@sinhon-os/config", "@sinhon-os/ui"]
};

export default nextConfig;
