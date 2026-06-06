import { getLocales } from "expo-localization";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import it from "./locales/it";

const deviceLanguage = getLocales()[0].languageTag;
i18next.use(initReactI18next).init({
  resources: { it, en },
  lng: deviceLanguage,
  fallbackLng: "en",
  // debug: true,
  interpolation: {
    escapeValue: false,
  },
});

export const i18n = i18next;
