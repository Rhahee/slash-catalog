// Deliberately synthetic. Never imported by the website or served in normal mode.
export function fixtureCatalog() {
  return {
    version: 2, scope: 'image-prompts', reviewedAt: '2026-11-10', status: 'ready',
    researchNote: {id: 'Fixture pengujian saja. Bukan prompt publik.', en: 'Test fixture only. Not public prompts.'},
    sources: [{url: 'https://example.com/', title: 'TEST SOURCE', note: {id: 'Sumber sintetis untuk pengujian.', en: 'Synthetic source for testing.'}}],
    categories: [
      {id: 'test-writing', label: {id: 'Tulisan uji', en: 'Test writing'}},
      {id: 'test-analysis', label: {id: 'Analisis uji', en: 'Test analysis'}}
    ],
    entries: [makeEntry('test-alpha', '/test-entry-a', 'test-writing', 'ringkasan rapat', 'meeting summary'), makeEntry('test-beta', '/test-entry-b', 'test-analysis', 'analisis tabel', 'table analysis')]
  };
}
function makeEntry(id, name, category, idKeywords, enKeywords) {
  return {
    id, name, category, platform: 'chatgpt-images', type: 'community-shorthand',
    access: {kind: 'shorthand', label: {id: 'Fixture kode uji.', en: 'Test code fixture.'}},
    example: {image: '/assets/examples/metaads.png', alt: {id: 'Contoh untuk fixture.', en: 'Example for fixture.'}, note: {id: 'Data fixture sintetis.', en: 'Synthetic fixture data.'}},
    keywords: {id: idKeywords, en: enKeywords},
    content: {
      id: {summary: `Entri sintetis untuk menguji ${idKeywords}.`, input: 'Bahan contoh sintetis.', steps: ['Langkah pengujian pertama.', 'Langkah pengujian kedua.'], prompt: `PROMPT UJI ${name}\nBaris kedua: teks & <contoh>.`, result: 'HASIL ILUSTRASI UJI\nTeks ini bukan keluaran ChatGPT.'},
      en: {summary: `Synthetic entry for testing ${enKeywords}.`, input: 'Synthetic sample input.', steps: ['First testing step.', 'Second testing step.'], prompt: `TEST PROMPT ${name}\nSecond line: text & <example>.`, result: 'TEST ILLUSTRATIVE RESULT\nThis is not ChatGPT output.'}
    },
    verification: {method: 'community', checkedAt: '2026-11-10', sources: [{url: 'https://example.com/', title: 'TEST SOURCE'}], note: {id: 'Metadata sintetis, hanya untuk tes.', en: 'Synthetic metadata, for tests only.'}}
  };
}
