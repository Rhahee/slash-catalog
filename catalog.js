export const languages = ['id', 'en'];
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const bilingual = value => value && languages.every(language => nonempty(value[language]));
const dateIsValid = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
export function safeUrl(value) {
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}

// This catalog contains community image-prompt shorthand, not app commands.
export function validateCatalog(data) {
  const assert = (condition, message) => { if (!condition) throw new Error(`Invalid catalog: ${message}`); };
  assert(data?.version === 2 && data.scope === 'image-prompts', 'image-prompts version 2 required');
  assert(dateIsValid(data.reviewedAt), 'reviewedAt must be a real ISO date');
  assert(['awaiting-verification', 'ready'].includes(data.status), 'unknown status');
  assert(bilingual(data.researchNote), 'researchNote requires id/en');
  assert(Array.isArray(data.sources) && data.sources.length > 0, 'sources required');
  for (const source of data.sources) assert(nonempty(source.title) && safeUrl(source.url) && bilingual(source.note), 'invalid research source');
  assert(Array.isArray(data.categories) && Array.isArray(data.entries), 'categories/entries must be arrays');
  const categoryIds = new Set();
  const validId = id => typeof id === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
  for (const category of data.categories) {
    assert(validId(category.id) && category.id !== 'all' && !categoryIds.has(category.id) && bilingual(category.label), 'invalid/duplicate category');
    categoryIds.add(category.id);
  }
  const entryIds = new Set();
  for (const entry of data.entries) {
    assert(validId(entry.id) && !entryIds.has(entry.id), 'invalid/duplicate entry id');
    entryIds.add(entry.id);
    assert(typeof entry.name === 'string' && /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.name) && categoryIds.has(entry.category), 'slash shorthand name/category required');
    assert(entry.platform === 'chatgpt-images' && entry.type === 'community-shorthand', 'only community image prompts are supported');
    assert(entry.access?.kind === 'shorthand' && bilingual(entry.access.label), 'shorthand access description required');
    assert(entry.example && /^\/assets\/examples\/[a-z0-9-]+\.png$/.test(entry.example.image) && bilingual(entry.example.alt) && bilingual(entry.example.note), 'local example image and bilingual descriptions required');
    assert(bilingual(entry.keywords), 'keywords require id/en strings');
    for (const language of languages) {
      const content = entry.content?.[language];
      assert(content && ['summary', 'input', 'prompt', 'result'].every(key => nonempty(content[key])), `incomplete ${language} entry`);
      assert(Array.isArray(content.steps) && content.steps.length > 0 && content.steps.every(nonempty), `missing ${language} steps`);
    }
    const verification = entry.verification;
    assert(verification && verification.method === 'community' && dateIsValid(verification.checkedAt), 'community attribution required');
    assert(Array.isArray(verification.sources) && verification.sources.length > 0, 'entry sources required');
    for (const source of verification.sources) assert(nonempty(source.title) && safeUrl(source.url), 'invalid entry source');
    assert(bilingual(verification.note), 'verification context requires id/en');
    if (entry.availability !== undefined) assert(bilingual(entry.availability), 'availability requires id/en');
  }
  assert(data.status !== 'ready' || data.entries.length > 0, 'ready requires reviewed entries');
  assert(data.status !== 'awaiting-verification' || data.entries.length === 0, 'awaiting verification cannot publish entries');
  return data;
}

export function filterEntries(entries, query = '', category = 'all') {
  const tokens = query.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return entries.filter(entry => {
    if (category !== 'all' && entry.category !== category) return false;
    const haystack = [entry.name, ...languages.flatMap(language => [entry.content[language].summary, entry.keywords[language], entry.access?.label[language] ?? ''])].join(' ').normalize('NFKC').toLocaleLowerCase();
    return tokens.every(token => haystack.includes(token));
  });
}

export function entryHash(id) { return `#command/${encodeURIComponent(id)}`; }
export function parseEntryHash(hash) {
  if (!hash.startsWith('#command/')) return null;
  try { return decodeURIComponent(hash.slice(9)); } catch { return ''; }
}

export function formatDate(value, language) {
  return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-US', {dateStyle: 'long', timeZone: 'UTC'}).format(new Date(`${value}T00:00:00Z`));
}
