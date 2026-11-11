import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateCatalog, filterEntries, parseEntryHash, entryHash, safeUrl, formatDate} from '../catalog.js';
import {messages, translate} from '../i18n.js';
import {fixtureCatalog} from './fixtures.mjs';

test('published catalog contains only attributed community image shorthands', async () => {
  const data = validateCatalog(JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8')));
  if (data.status === 'awaiting-verification') assert.deepEqual(data.entries, []);
  for (const entry of data.entries) {
    assert.ok(entry.access, 'published entries must state their documented access method');
    assert.ok(!entry.id.startsWith('test-'), 'synthetic fixture must never be published');
    assert.ok(!entry.name.startsWith('TEST ENTRY'), 'synthetic fixture name must never be published');
    for (const source of entry.verification.sources) assert.notEqual(new URL(source.url).hostname, 'example.com', 'placeholder source must never be published');
  }
});
test('complete bilingual fixture validates', () => assert.equal(validateCatalog(fixtureCatalog()).entries.length, 2));
test('search matches names, use cases and keywords across languages', () => {
  const {entries} = fixtureCatalog();
  for (const query of ['meeting', 'RINGKASAN', '  test   entry a  ', 'ringkasan summary']) assert.equal(filterEntries(entries, query)[0]?.id, 'test-alpha');
  assert.equal(filterEntries(entries, 'unknown').length, 0);
  assert.equal(filterEntries(entries, '  ').length, 2);
  entries[0].access = {kind: 'shorthand', label: {id: 'label-akses-khusus', en: 'access-only-marker'}};
  assert.equal(filterEntries(entries, 'access-only-marker')[0].id, 'test-alpha');
});
test('category and query combine, clearing both restores all results', () => {
  const {entries} = fixtureCatalog();
  assert.equal(filterEntries(entries, 'summary', 'test-analysis').length, 0);
  assert.equal(filterEntries(entries, 'tabel', 'test-analysis')[0].id, 'test-beta');
  assert.equal(filterEntries(entries, '', 'all').length, 2);
});
test('shareable hashes decode and malformed or unrelated hashes are safe', () => {
  assert.equal(parseEntryHash(entryHash('test-alpha')), 'test-alpha');
  assert.equal(parseEntryHash('#guide'), null);
  assert.equal(parseEntryHash('#command/%ZZ'), '');
  assert.equal(parseEntryHash('#command/missing'), 'missing');
});
test('invalid, incomplete, duplicate and out-of-scope content is rejected', () => {
  const mutations = [
    data => data.entries.push(structuredClone(data.entries[0])),
    data => delete data.entries[0].content.en,
    data => data.entries[0].content.id.steps = [],
    data => data.entries[0].verification.sources = [],
    data => data.entries[0].verification.sources[0].url = 'javascript:alert(1)',
    data => data.entries[0].verification.checkedAt = '2026-02-30',
    data => data.entries[0].category = 'unknown',
    data => data.entries[0].platform = 'codex',
    data => data.scope = 'general-app-commands',
    data => data.version = 1,
    data => data.entries[0].type = 'official-command',
    data => data.entries[0].name = 'Search',
    data => data.entries[0].example.image = 'https://example.com/tracker.png',
    data => data.entries[0].example.image = '/assets/examples/../private.png',
    data => delete data.entries[0].example.alt.en,
    data => delete data.entries[0].content.en.input,
    data => data.entries[0].availability = {id: 'Hanya satu bahasa'},
    data => data.entries[0].access = {kind: 'invented-command', label: {id: 'Akses', en: 'Access'}},
    data => data.entries[0].access = {kind: 'menu', label: {id: 'Hanya satu bahasa'}},
    data => data.entries[0].verification = undefined,
    data => data.categories.push(structuredClone(data.categories[0])),
    data => data.status = 'awaiting-verification'
  ];
  for (const mutate of mutations) { const data = fixtureCatalog(); mutate(data); assert.throws(() => validateCatalog(data), /Invalid catalog/); }
});
test('every public visual example is an existing square PNG in the project', async () => {
  const data = validateCatalog(JSON.parse(await readFile(new URL('../data/catalog.json', import.meta.url), 'utf8')));
  const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  for (const entry of data.entries) {
    const bytes = await readFile(new URL(`..${entry.example.image}`, import.meta.url));
    assert.ok(bytes.subarray(0, 8).equals(pngSignature), `${entry.id}: not a PNG`);
    assert.ok(bytes.readUInt32BE(16) > 0, `${entry.id}: missing image width`);
    assert.equal(bytes.readUInt32BE(16), bytes.readUInt32BE(20), `${entry.id}: expected square example`);
  }
});
test('only HTTPS source URLs without credentials are accepted', () => {
  for (const url of ['javascript:alert(1)', 'http://example.com', '/relative', 'https://user:pass@example.com/']) assert.equal(safeUrl(url), null);
  assert.equal(safeUrl('https://example.com/'), 'https://example.com/');
});
test('translations have complete matching keys, interpolation and dates', () => {
  assert.deepEqual(Object.keys(messages.id).sort(), Object.keys(messages.en).sort());
  for (const language of ['id', 'en']) for (const value of Object.values(messages[language])) assert.ok(value.trim());
  assert.equal(translate('en', 'resultCount', {visible: 1, total: 2}), '1 of 2 entries');
  assert.equal(formatDate('2026-11-10', 'id'), '10 November 2026');
  assert.equal(formatDate('2026-11-10', 'en'), 'November 10, 2026');
});
