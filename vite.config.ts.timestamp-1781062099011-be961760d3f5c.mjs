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
  server: {
    host: "0.0.0.0",
    port: 5137,
    strictPort: true
  },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAic3JjL3Jlc29sdmVyL2luZGV4LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcaG9tZVxcXFxJZGVhUHJvamVjdHNcXFxcZW5vd19wcm9qZWN0XFxcXGVub3ctcGFkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxob21lXFxcXElkZWFQcm9qZWN0c1xcXFxlbm93X3Byb2plY3RcXFxcZW5vdy1wYWRcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0Q6L2hvbWUvSWRlYVByb2plY3RzL2Vub3dfcHJvamVjdC9lbm93LXBhZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCBVbmkgZnJvbSAnQHVuaS1oZWxwZXIvcGx1Z2luLXVuaSdcclxuaW1wb3J0IHsgaXNNcFdlaXhpbiB9IGZyb20gJ0B1bmktaGVscGVyL3VuaS1lbnYnXHJcbmltcG9ydCBVbmlIZWxwZXJDb21wb25lbnRzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzJ1xyXG5pbXBvcnQgVW5pSGVscGVyTGF5b3V0cyBmcm9tICdAdW5pLWhlbHBlci92aXRlLXBsdWdpbi11bmktbGF5b3V0cydcclxuaW1wb3J0IFVuaUhlbHBlck1hbmlmZXN0IGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1tYW5pZmVzdCdcclxuaW1wb3J0IFVuaUhlbHBlclBhZ2VzIGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1wYWdlcydcclxuaW1wb3J0IE9wdGltaXphdGlvbiBmcm9tICdAdW5pLWt1L2J1bmRsZS1vcHRpbWl6ZXInXHJcbmltcG9ydCBVbmlLdVJvb3QgZnJvbSAnQHVuaS1rdS9yb290J1xyXG5pbXBvcnQgeyBVbmlFY2hhcnRzUmVzb2x2ZXIgfSBmcm9tICd1bmktZWNoYXJ0cy9yZXNvbHZlcidcclxuaW1wb3J0IHsgVW5pRWNoYXJ0cyB9IGZyb20gJ3VuaS1lY2hhcnRzL3ZpdGUnXHJcbmltcG9ydCBVbm9DU1MgZnJvbSAndW5vY3NzL3ZpdGUnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCB7IFdvdFJlc29sdmVyIH0gZnJvbSAnLi9zcmMvcmVzb2x2ZXInXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgYmFzZTogJy4vJyxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcwLjAuMC4wJyxcclxuICAgIHBvcnQ6IDUxMzcsXHJcbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxyXG4gIH0sXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBleGNsdWRlOiBbJ0B3b3QtdWkvdWknLCAndW5pLWVjaGFydHMnXSxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1tYW5pZmVzdFxyXG4gICAgVW5pSGVscGVyTWFuaWZlc3QoKSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1wYWdlc1xyXG4gICAgVW5pSGVscGVyUGFnZXMoe1xyXG4gICAgICBkdHM6ICdzcmMvdW5pLXBhZ2VzLmQudHMnLFxyXG4gICAgICBzdWJQYWNrYWdlczogW1xyXG4gICAgICAgICdzcmMvc3ViUGFnZXMnLFxyXG4gICAgICAgICdzcmMvc3ViRWNoYXJ0cycsXHJcbiAgICAgICAgJ3NyYy9zdWJBc3luY0VjaGFydHMnLFxyXG4gICAgICBdLFxyXG4gICAgICAvKipcclxuICAgICAgICogXHU2MzkyXHU5NjY0XHU3Njg0XHU5ODc1XHU5NzYyXHVGRjBDXHU3NkY4XHU1QkY5XHU0RThFIGRpciBcdTU0OEMgc3ViUGFja2FnZXNcclxuICAgICAgICogQGRlZmF1bHQgW11cclxuICAgICAgICovXHJcbiAgICAgIGV4Y2x1ZGU6IFsnKiovY29tcG9uZW50cy8qKi8qLionXSxcclxuICAgIH0pLFxyXG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWxheW91dHNcclxuICAgIFVuaUhlbHBlckxheW91dHMoKSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzXHJcbiAgICBVbmlIZWxwZXJDb21wb25lbnRzKHtcclxuICAgICAgcmVzb2x2ZXJzOiBbV290UmVzb2x2ZXIoKSwgVW5pRWNoYXJ0c1Jlc29sdmVyKCldLFxyXG4gICAgICBkdHM6ICdzcmMvY29tcG9uZW50cy5kLnRzJyxcclxuICAgICAgZGlyczogWydzcmMvY29tcG9uZW50cycsICdzcmMvYnVzaW5lc3MnXSxcclxuICAgICAgZGlyZWN0b3J5QXNOYW1lc3BhY2U6IHRydWUsXHJcbiAgICB9KSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bmkta3Uvcm9vdFxyXG4gICAgVW5pS3VSb290KCksXHJcbiAgICAvLyBodHRwczovL3VuaS1lY2hhcnRzLnhpYW9oZS5pbmtcclxuICAgIFVuaUVjaGFydHMoKSxcclxuICAgIC8vIGh0dHBzOi8vdW5pLWhlbHBlci5jbi9wbHVnaW4tdW5pXHJcbiAgICBVbmkoKSxcclxuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bmkta3UvYnVuZGxlLW9wdGltaXplclxyXG4gICAgT3B0aW1pemF0aW9uKHtcclxuICAgICAgZW5hYmxlOiBpc01wV2VpeGluLFxyXG4gICAgICBsb2dnZXI6IGZhbHNlLFxyXG4gICAgfSksXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5wbHVnaW4tYXV0by1pbXBvcnRcclxuICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICBpbXBvcnRzOiBbJ3Z1ZScsICdAdnVldXNlL2NvcmUnLCAncGluaWEnLCAndW5pLWFwcCcsIHtcclxuICAgICAgICBmcm9tOiAnQHdvdC11aS9yb3V0ZXInLFxyXG4gICAgICAgIGltcG9ydHM6IFsnY3JlYXRlUm91dGVyJywgJ3VzZVJvdXRlcicsICd1c2VSb3V0ZSddLFxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgZnJvbTogJ0B3b3QtdWkvdWknLFxyXG4gICAgICAgIGltcG9ydHM6IFsndXNlVG9hc3QnLCAndXNlRGlhbG9nJywgJ3VzZU5vdGlmeScsICdDb21tb25VdGlsJ10sXHJcbiAgICAgIH0sIHtcclxuICAgICAgICBmcm9tOiAnYWxvdmEvY2xpZW50JyxcclxuICAgICAgICBpbXBvcnRzOiBbJ3VzZVBhZ2luYXRpb24nLCAndXNlUmVxdWVzdCddLFxyXG4gICAgICB9XSxcclxuICAgICAgZHRzOiAnc3JjL2F1dG8taW1wb3J0cy5kLnRzJyxcclxuICAgICAgZGlyczogWydzcmMvY29tcG9zYWJsZXMnLCAnc3JjL3N0b3JlJywgJ3NyYy91dGlscycsICdzcmMvYXBpJ10sXHJcbiAgICAgIHZ1ZVRlbXBsYXRlOiB0cnVlLFxyXG4gICAgfSksXHJcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW50ZnUvdW5vY3NzXHJcbiAgICAvLyBzZWUgdW5vY3NzLmNvbmZpZy50cyBmb3IgY29uZmlnXHJcbiAgICBVbm9DU1MoKSxcclxuICBdLFxyXG4gIGNzczoge1xyXG4gICAgcHJlcHJvY2Vzc29yT3B0aW9uczoge1xyXG4gICAgICBzY3NzOiB7XHJcbiAgICAgICAgYXBpOiAnbW9kZXJuLWNvbXBpbGVyJyxcclxuICAgICAgICBzaWxlbmNlRGVwcmVjYXRpb25zOiBbJ2xlZ2FjeS1qcy1hcGknXSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxufSlcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxob21lXFxcXElkZWFQcm9qZWN0c1xcXFxlbm93X3Byb2plY3RcXFxcZW5vdy1wYWRcXFxcc3JjXFxcXHJlc29sdmVyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxob21lXFxcXElkZWFQcm9qZWN0c1xcXFxlbm93X3Byb2plY3RcXFxcZW5vdy1wYWRcXFxcc3JjXFxcXHJlc29sdmVyXFxcXGluZGV4LnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9ob21lL0lkZWFQcm9qZWN0cy9lbm93X3Byb2plY3QvZW5vdy1wYWQvc3JjL3Jlc29sdmVyL2luZGV4LnRzXCI7aW1wb3J0IHR5cGUgeyBDb21wb25lbnRSZXNvbHZlciB9IGZyb20gJ0B1bmktaGVscGVyL3ZpdGUtcGx1Z2luLXVuaS1jb21wb25lbnRzJ1xyXG5cclxuaW1wb3J0IHsga2ViYWJDYXNlIH0gZnJvbSAnQHVuaS1oZWxwZXIvdml0ZS1wbHVnaW4tdW5pLWNvbXBvbmVudHMnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gV290UmVzb2x2ZXIoKTogQ29tcG9uZW50UmVzb2x2ZXIge1xyXG4gIHJldHVybiB7XHJcbiAgICB0eXBlOiAnY29tcG9uZW50JyxcclxuICAgIHJlc29sdmU6IChuYW1lOiBzdHJpbmcpID0+IHtcclxuICAgICAgaWYgKG5hbWUubWF0Y2goL15XZFtBLVpdLykpIHtcclxuICAgICAgICBjb25zdCBjb21wTmFtZSA9IGtlYmFiQ2FzZShuYW1lKVxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgZnJvbTogYEB3b3QtdWkvdWkvY29tcG9uZW50cy8ke2NvbXBOYW1lfS8ke2NvbXBOYW1lfS52dWVgLFxyXG4gICAgICAgIH1cclxuICAgICAgfVxy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
