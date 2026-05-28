// vite.config.ts
import Uni from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+plugin-uni@0.1.0_@dcloudio+vite-plugin-uni@3.0.0-5000720260410001_@vueuse+core@11_vmkjwo4q6ntlbppaykppjd2bda/node_modules/@uni-helper/plugin-uni/src/index.js";
import { isMpWeixin } from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+uni-env@0.2.0/node_modules/@uni-helper/uni-env/dist/index.js";
import UniHelperComponents from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.6_rollup@4.53.2/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
import UniHelperLayouts from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+vite-plugin-uni-layouts@0.1.11_rollup@4.53.2/node_modules/@uni-helper/vite-plugin-uni-layouts/dist/index.mjs";
import UniHelperManifest from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+vite-plugin-uni-manifest@0.2.12_vite@5.2.8_@types+node@20.19.25_sass@1.99.0_terser@5.31.6_/node_modules/@uni-helper/vite-plugin-uni-manifest/dist/index.mjs";
import UniHelperPages from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+vite-plugin-uni-pages@0.3.23_vite@5.2.8_@types+node@20.19.25_sass@1.99.0_terser@5.31.6_/node_modules/@uni-helper/vite-plugin-uni-pages/dist/index.mjs";
import Optimization from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-ku+bundle-optimizer@2.1.0_@vueuse+core@11.0.3_vue@3.4.38_typescript@5.5.4___chokidar@3.6_id4czrlujqe2vfmmdhz4utufyi/node_modules/@uni-ku/bundle-optimizer/dist/index.mjs";
import UniKuRoot from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-ku+root@1.4.1_vite@5.2.8_@types+node@20.19.25_sass@1.99.0_terser@5.31.6_/node_modules/@uni-ku/root/dist/index.mjs";
import { UniEchartsResolver } from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/uni-echarts@2.2.5_echarts@6.0.0_vue@3.4.38_typescript@5.5.4_/node_modules/uni-echarts/dist-resolver/index.mjs";
import { UniEcharts } from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/uni-echarts@2.2.5_echarts@6.0.0_vue@3.4.38_typescript@5.5.4_/node_modules/uni-echarts/dist-vite/index.mjs";
import UnoCSS from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/unocss@66.0.0_postcss@8.5.10_vite@5.2.8_@types+node@20.19.25_sass@1.99.0_terser@5.31.6__vue@3.4.38_typescript@5.5.4_/node_modules/unocss/dist/vite.mjs";
import AutoImport from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/unplugin-auto-import@0.18.2_@vueuse+core@11.0.3_vue@3.4.38_typescript@5.5.4___rollup@4.53.2/node_modules/unplugin-auto-import/dist/vite.js";
import { defineConfig } from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/vite@5.2.8_@types+node@20.19.25_sass@1.99.0_terser@5.31.6/node_modules/vite/dist/node/index.js";

// src/resolver/index.ts
import { kebabCase } from "file:///D:/home/IdeaProjects/enow_project/enow-pad/node_modules/.pnpm/@uni-helper+vite-plugin-uni-components@0.2.6_rollup@4.53.2/node_modules/@uni-helper/vite-plugin-uni-components/dist/index.mjs";
function WotResolver() {
  return {
    type: "component",
    resolve: (name) => {
      if (name.match(/^Wd[A-Z]/)) {
        const compName = kebabCase(name);
        return {
          name,
          from: `@wot-ui/ui/components/${compName}/${compName}.vue`
        };
      }
    }
  };
}

// vite.config.ts
var vite_config_default = defineConfig({
  base: "./",
  optimizeDeps: {
    exclude: ["@wot-ui/ui", "uni-echarts"]
  },
  plugins: [
    // https://github.com/uni-helper/vite-plugin-uni-manifest
    UniHelperManifest(),
    // https://github.com/uni-helper/vite-plugin-uni-pages
    UniHelperPages({
      dts: "src/uni-pages.d.ts",
      subPackages: [
        "src/subPages",
        "src/subEcharts",
        "src/subAsyncEcharts"
      ],
      /**
       * 排除的页面，相对于 dir 和 subPackages
       * @default []
       */
      exclude: ["**/components/**/*.*"]
    }),
    // https://github.com/uni-helper/vite-plugin-uni-layouts
    UniHelperLayouts(),
    // https://github.com/uni-helper/vite-plugin-uni-components
    UniHelperComponents({
      resolvers: [WotResolver(), UniEchartsResolver()],
      dts: "src/components.d.ts",
      dirs: ["src/components", "src/business"],
      directoryAsNamespace: true
    }),
    // https://github.com/uni-ku/root
    UniKuRoot(),
    // https://uni-echarts.xiaohe.ink
    UniEcharts(),
    // https://uni-helper.cn/plugin-uni
    Uni(),
    // https://github.com/uni-ku/bundle-optimizer
    Optimization({
      enable: isMpWeixin,
      logger: false
    }),
    // https://github.com/antfu/unplugin-auto-import
    AutoImport({
      imports: ["vue", "@vueuse/core", "pinia", "uni-app", {
        from: "@wot-ui/router",
        imports: ["createRouter", "useRouter", "useRoute"]
      }, {
        from: "@wot-ui/ui",
        imports: ["useToast", "useDialog", "useNotify", "CommonUtil"]
      }, {
        from: "alova/client",
        imports: ["usePagination", "useRequest"]
      }],
      dts: "src/auto-imports.d.ts",
      dirs: ["src/composables", "src/store", "src/utils", "src/api"],
      vueTemplate: true
    }),
    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    UnoCSS()
  ],
  css: {
    preprocessorOptions: {
      scss: {
        api: "modern-compiler",
        silenceDeprecations: ["legacy-js-api"]
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3Jlc29sdmVyL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcaG9tZVxcXFxJZGVhUHJvamVjdHNcXFxcZW5vd19wcm9qZWN0XFxcXGVub3ctcGFkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxob21lXFxcXElkZWFQcm9qZWN0c1xcXFxlbm93X3Byb2plY3RcXFxcZW5vdy1wYWRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2hvbWUvSWRlYVByb2plY3RzL2Vub3dfcHJvamVjdC9lbm93LXBhZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBVbmkgZnJvbSAnQHVuaS1oZWxwZXIvcGx1Z2luLXVuaSdcclxuaW1wb3J0IHsgaXNNcFdlaXhpbiB9IGZyb20gJ0B1bmktaGVscGVyL3VuaS1lbnYnXHJcbmltcG9ydCBVbmlIZWxwZXJDb21wb25lbnRzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzJ1xyXG5pbXBvcnQgVW5pSGVscGVyTGF5b3V0cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktbGF5b3V0cydcclxuaW1wb3J0IFVuaUhlbHBlck1hbmlmZXN0IGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1tYW5pZmVzdCdcclxuaW1wb3J0IFVuaUhlbHBlclBhZ2VzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1wYWdlcydcclxuaW1wb3J0IE9wdGltaXphdGlvbiBmcm9tICdAdW5pLWt1L2J1bmRsZS1vcHRpbWl6ZXInXHJcbmltcG9ydCBVbmlLdVJvb3QgZnJvbSAnQHVuaS1rdS9yb290J1xyXG5pbXBvcnQgeyBVbmlFY2hhcnRzUmVzb2x2ZXIgfSBmcm9tICd1bmktZWNoYXJ0cy9yZXNvbHZlcidcclxuaW1wb3J0IHsgVW5pRWNoYXJ0cyB9IGZyb20gJ3VuaS1lY2hhcnRzL3ZpdGUnXHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IFdvdFJlc29sdmVyIH0gZnJvbSAnLi9zcmMvcmVzb2x2ZXInXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy4vJyxcclxuICBvcHRpbWl6ZURlcHM6IHtcclxuICAgIGV4Y2x1ZGU6IFsnQHdvdC11aS91aScsICd1bmktZWNoYXJ0cyddLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLW1hbmlmZXN0XHJcbiAgICBVbmlIZWxwZXJNYW5pZmVzdCgpLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLXBhZ2VzXHJcbiAgICBVbmlIZWxwZXJQYWdlcyh7XHJcbiAgICAgIGR0czogJ3NyYy91bmktcGFnZXMuZC50cycsXHJcbiAgICAgIHN1YlBhY2thZ2VzOiBbXHJcbiAgICAgICAgJ3NyYy9zdWJQYWdlcycsXHJcbiAgICAgICAgJ3NyYy9zdWJFY2hhcnRzJyxcclxuICAgICAgICAnc3JjL3N1YkFzeW5jRWNoYXJ0cycsXHJcbiAgICAgIF0sXHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBcdTYzOTJcdTk2NjRcdTc2ODRcdTk4NzVcdTk3NjJcdUZGMENcdTc2RjhcdTVCRjlcdTRFOEUgZGlyIFx1NTQ4QyBzdWJQYWNrYWdlc1xyXG4gICAgICAgKiBAZGVmYXVsdCBbXVxyXG4gICAgICAgKi9cclxuICAgICAgZXhjbHVkZTogWycqKi9jb21wb25lbnRzLyoqLyouKiddLFxyXG4gICAgfSksXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktbGF5b3V0c1xyXG4gICAgVW5pSGVscGVyTGF5b3V0cygpLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHNcclxuICAgIFVuaUhlbHBlckNvbXBvbmVudHMoe1xyXG4gICAgICByZXNvbHZlcnM6IFtXb3RSZXNvbHZlcigpLCBVbmlFY2hhcnRzUmVzb2x2ZXIoKV0sXHJcbiAgICAgIGR0czogJ3NyYy9jb21wb25lbnRzLmQudHMnLFxyXG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb25lbnRzJywgJ3NyYy9idXNpbmVzcyddLFxyXG4gICAgICBkaXJlY3RvcnlBc05hbWVzcGFjZTogdHJ1ZSxcclxuICAgIH0pLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9yb290XHJcbiAgICBVbmlLdVJvb3QoKSxcclxuICAgIC8vIGh0dHBzOi8vdW5pLWVjaGFydHMueGlhb2hlLmlua1xyXG4gICAgVW5pRWNoYXJ0cygpLFxyXG4gICAgLy8gaHR0cHM6Ly91bmktaGVscGVyLmNuL3BsdWdpbi11bmlcclxuICAgIFVuaSgpLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1rdS9idW5kbGUtb3B0aW1pemVyXHJcbiAgICBPcHRpbWl6YXRpb24oe1xyXG4gICAgICBlbmFibGU6IGlzTXBXZWl4aW4sXHJcbiAgICAgIGxvZ2dlcjogZmFsc2UsXHJcbiAgICB9KSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bnBsdWdpbi1hdXRvLWltcG9ydFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFsndnVlJywgJ0B2dWV1c2UvY29yZScsICdwaW5pYScsICd1bmktYXBwJywge1xyXG4gICAgICAgIGZyb206ICdAd290LXVpL3JvdXRlcicsXHJcbiAgICAgICAgaW1wb3J0czogWydjcmVhdGVSb3V0ZXInLCAndXNlUm91dGVyJywgJ3VzZVJvdXRlJ10sXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBmcm9tOiAnQHdvdC11aS91aScsXHJcbiAgICAgICAgaW1wb3J0czogWyd1c2VUb2FzdCcsICd1c2VEaWFsb2cnLCAndXNlTm90aWZ5JywgJ0NvbW1vblV0aWwnXSxcclxuICAgICAgfSwge1xyXG4gICAgICAgIGZyb206ICdhbG92YS9jbGllbnQnLFxyXG4gICAgICAgIGltcG9ydHM6IFsndXNlUGFnaW5hdGlvbicsICd1c2VSZXF1ZXN0J10sXHJcbiAgICAgIH1dLFxyXG4gICAgICBkdHM6ICdzcmMvYXV0by1pbXBvcnRzLmQudHMnLFxyXG4gICAgICBkaXJzOiBbJ3NyYy9jb21wb3NhYmxlcycsICdzcmMvc3RvcmUnLCAnc3JjL3V0aWxzJywgJ3NyYy9hcGknXSxcclxuICAgICAgdnVlVGVtcGxhdGU6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbnRmdS91bm9jc3NcclxuICAgIC8vIHNlZSB1bm9jc3MuY29uZmlnLnRzIGZvciBjb25maWdcclxuICAgIFVub0NTUygpLFxyXG4gIF0sXHJcbiAgY3NzOiB7XHJcbiAgICBwcmVwcm9jZXNzb3JPcHRpb25zOiB7XHJcbiAgICAgIHNjc3M6IHtcclxuICAgICAgICBhcGk6ICdtb2Rlcm4tY29tcGlsZXInLFxyXG4gICAgICAgIHNpbGVuY2VEZXByZWNhdGlvbnM6IFsnbGVnYWN5LWpzLWFwaSddLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KVxyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkQ6XFxcXGhvbWVcXFxcSWRlYVByb2plY3RzXFxcXGVub3dfcHJvamVjdFxcXFxlbm93LXBhZFxcXFxzcmNcXFxccmVzb2x2ZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGhvbWVcXFxcSWRlYVByb2plY3RzXFxcXGVub3dfcHJvamVjdFxcXFxlbm93LXBhZFxcXFxzcmNcXFxccmVzb2x2ZXJcXFxcaW5kZXgudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2hvbWUvSWRlYVByb2plY3RzL2Vub3dfcHJvamVjdC9lbm93LXBhZC9zcmMvcmVzb2x2ZXIvaW5kZXgudHNcIjtpbXBvcnQgdHlwZSB7IENvbXBvbmVudFJlc29sdmVyIH0gZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHMnXHJcblxyXG5pbXBvcnQgeyBrZWJhYkNhc2UgfSBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktY29tcG9uZW50cydcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBXb3RSZXNvbHZlcigpOiBDb21wb25lbnRSZXNvbHZlciB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHR5cGU6ICdjb21wb25lbnQnLFxyXG4gICAgcmVzb2x2ZTogKG5hbWU6IHN0cmluZykgPT4ge1xyXG4gICAgICBpZiAobmFtZS5tYXRjaCgvXldkW0EtWl0vKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbXBOYW1lID0ga2ViYWJDYXNlKG5hbWUpXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICBmcm9tOiBgQHdvdC11aS91aS9jb21wb25lbnRzLyR7Y29tcE5hbWV9LyR7Y29tcE5hbWV9LnZ1ZWAsXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gIH1cclxufVxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBULE9BQU8sU0FBUztBQUMxVSxTQUFTLGtCQUFrQjtBQUMzQixPQUFPLHlC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
