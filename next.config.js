// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the file extension.
    // For example, to use remark-gfm with Next.js 13.4, you can use:
    // import remarkGfm from 'remark-gfm'
    // content: '**Hello**',
    // remarkPlugins: [remarkGfm],
    // rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  reactStrictMode: true,
};

module.exports = withMDX(nextConfig);
