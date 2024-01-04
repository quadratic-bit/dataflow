import DarkTheme from "./src/themes/dark";
import LightTheme from "./src/themes/light";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
    title: "Dataflow Docs",
    tagline: "Dependency-free TypeScript library making your HTML tables interactive",
    favicon: "img/favicon.ico",

    url: "https://quadratic-bit.github.io",

    baseUrl: "/dataflow/",

    organizationName: "quadratic-bit",
    projectName: "dataflow",
    deploymentBranch: "gh-pages",

    onBrokenLinks: "throw",
    onBrokenMarkdownLinks: "warn",

    trailingSlash: true,

    i18n: {
        defaultLocale: "en",
        locales: ["en"]
    },

    presets: [
        [
            "classic",
            {
                docs: { sidebarPath: "./sidebars.ts" },
                theme: { customCss: "./src/css/default.css" }
            } satisfies Preset.Options
        ]
    ],
    themeConfig: {
        // To be replaced
        image: "img/docusaurus-social-card.jpg",
        colorMode: {
            defaultMode: "dark",
            respectPrefersColorScheme: true
        },
        navbar: {
            title: "Dataflow",
            logo: {
                alt: "Dataflow Logo",
                src: "img/logo.svg"
            },
            items: [
                {
                    type: "docSidebar",
                    sidebarId: "tutorialSidebar",
                    position: "left",
                    label: "Tutorial"
                },
                {
                    href: "https://github.com/quadratic-bit/dataflow",
                    label: "GitHub",
                    position: "right"
                }
            ]
        },
        footer: {
            style: "dark",
            copyright: `Copyleft 🄯 ${new Date().getFullYear()} Dataflow. Built with Docusaurus.`
        },
        prism: {
            theme: LightTheme,
            darkTheme: DarkTheme,
            additionalLanguages: ["json", "bash"]
        },
    } satisfies Preset.ThemeConfig
};

export default config;
