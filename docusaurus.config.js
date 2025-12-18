const { themes: prismThemes } = require("prism-react-renderer");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Mission Control",
  tagline: "Executive Performance Intelligence",
  favicon: "img/mbmc_favicon.png",

  headTags: [
    {
      tagName: "script",
      attributes: {},
      innerHTML: `
        window.APP_USER = {
          firstName: "Cody"
        };
      `,
    },
  ],

  future: {
    v4: true,
  },

  // ================================
  // 🌐 CUSTOM DOMAIN CONFIG
  // ================================
url: "https://brickhouser3.github.io",
baseUrl: "/ci_capabilities/",
trailingSlash: false,

organizationName: "brickhouser3",
projectName: "ci_capabilities",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: false,
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      },
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",

    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: "light",
      disableSwitch: true,
    },

    navbar: {
      items: [],
    },

    footer: {
      style: "dark",
      links: [],
      copyright: " ",
    },

    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

module.exports = config;
