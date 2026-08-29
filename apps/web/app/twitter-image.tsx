// Route segment config has to be statically analysable, so `dynamic` is
// declared here rather than re-exported from the Open Graph route.
export const dynamic = 'force-static';

export { default, alt, size, contentType } from './opengraph-image';
