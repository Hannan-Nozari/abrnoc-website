// @ts-check
import { defineConfig } from 'astro/config';

// Pixel-perfect static port of abrnoc.com homepage.
// We embed the original Gatsby-rendered HTML verbatim, so we want Astro
// to do as little as possible: no compression, no inlining, no transforms.
export default defineConfig({
  output: 'static',
  compressHTML: false,
  build: {
    inlineStylesheets: 'never',
    assets: '_astro_internal',
  },
});
