export default {
  locales: ["en", "it"],
  extract: {
    input: "**/*.{js,jsx,ts,tsx}",
    output: "lib/i18n/locales/{{language}}/{{namespace}}.json",
  },
};
