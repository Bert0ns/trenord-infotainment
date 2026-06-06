import enLoc from "@/lib/i18n/locales/en";
import itLoc from "@/lib/i18n/locales/it";

type Obj = { [key: string]: string | Obj };

function collectKeys(obj: Obj, prefix = ""): string[] {
  const keys = [];
  for (const k of Object.keys(obj)) {
    const val = obj[k];
    const path = prefix ? `${prefix}.${k}` : k;
    if (val && typeof val === "object") {
      keys.push(...collectKeys(val, path));
    } else {
      keys.push(path);
    }
  }
  return keys;
}

describe("Localization files", () => {
  it.each(Object.keys(enLoc) as (keyof typeof enLoc)[])(
    "namespace %s has matching keys in Italian",
    (ns) => {
      const enKeys = collectKeys(enLoc[ns]);
      const itKeys = collectKeys(itLoc[ns]);

      // Ensure every English key exists in Italian translation
      for (const key of enKeys) {
        expect(itKeys).toContain(key);
      }
    },
  );

  it("English translations are non-empty strings", () => {
    for (const ns of Object.keys(enLoc) as (keyof typeof enLoc)[]) {
      const keys = collectKeys(enLoc[ns]);
      for (const k of keys) {
        const parts = k.split(".");
        let node: any = enLoc[ns];
        for (const p of parts) node = node[p];
        expect(typeof node === "string" && node.length > 0).toBe(true);
      }
    }
  });
});
