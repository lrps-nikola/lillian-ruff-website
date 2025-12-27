import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D9NasuQV.mjs';
import { manifest } from './manifest_L12deTU1.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/about.astro.mjs');
const _page3 = () => import('./pages/api/create-payment.astro.mjs');
const _page4 = () => import('./pages/blog/_slug_.astro.mjs');
const _page5 = () => import('./pages/blog/_---page_.astro.mjs');
const _page6 = () => import('./pages/boarding.astro.mjs');
const _page7 = () => import('./pages/careers.astro.mjs');
const _page8 = () => import('./pages/contact.astro.mjs');
const _page9 = () => import('./pages/grooming.astro.mjs');
const _page10 = () => import('./pages/memberships.astro.mjs');
const _page11 = () => import('./pages/pricing.astro.mjs');
const _page12 = () => import('./pages/privacy.astro.mjs');
const _page13 = () => import('./pages/shop.astro.mjs');
const _page14 = () => import('./pages/terms.astro.mjs');
const _page15 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/about.astro", _page2],
    ["src/pages/api/create-payment.ts", _page3],
    ["src/pages/blog/[slug].astro", _page4],
    ["src/pages/blog/[...page].astro", _page5],
    ["src/pages/boarding.astro", _page6],
    ["src/pages/careers.astro", _page7],
    ["src/pages/contact.astro", _page8],
    ["src/pages/grooming.astro", _page9],
    ["src/pages/memberships.astro", _page10],
    ["src/pages/pricing.astro", _page11],
    ["src/pages/privacy.astro", _page12],
    ["src/pages/shop.astro", _page13],
    ["src/pages/terms.astro", _page14],
    ["src/pages/index.astro", _page15]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "78936e4d-434e-4225-b031-c530ae6c7b0d",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
