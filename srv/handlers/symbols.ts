import * as cds from "@sap/cds";
const { Symbol, SymbolTranslation } = cds.entities;

export const translate = async (req: cds.Request) => {
  const ids = Array.isArray(req.params) ? req.params : [req.params];

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const jobs = ids.map(async (id: any) => {
    const records = await SELECT.from(Symbol).where({ ID: id });
    if (!records || records.length === 0) return;

    const record = records[0];
    const original = record.symbol ?? "";
    const mappings = await SELECT.from(SymbolTranslation).where({
      language: record.language,
    });

    let translated = original;

    for (const m of mappings) {
      if (!m.symbol) continue;
      const pattern = new RegExp(escapeRegExp(m.symbol.toString()), "g");
      translated = translated.replace(pattern, m.translation ?? "");
    }

    await UPDATE.entity(Symbol)
      .set({ translation: translated })
      .where({ ID: id });
  });

  await Promise.all(jobs);

  return req;
};
