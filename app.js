import { validateCatalog, filterEntries, entryHash, parseEntryHash, formatDate } from './catalog.js';
import { translate } from './i18n.js';

const $ = selector => document.querySelector(selector);
const state = { language: 'id', data: null, query: '', category: 'all', error: false, loading: true };
const STORAGE_KEY = 'slash-catalog-language';
try { const saved = localStorage.getItem(STORAGE_KEY); if (['id', 'en'].includes(saved)) state.language = saved; } catch { /* Storage can be unavailable in private contexts. */ }
const t = (key, values) => translate(state.language, key, values);
const node = (tag, className, text) => { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; };
let toastTimer;
let detailTrigger;
let openedFromCatalog = false;
let copyGeneration = 0;
let loadingGeneration = 0;

function showToast(key) {
  clearTimeout(toastTimer);
  $('#toast').textContent = t(key);
  toastTimer = setTimeout(() => { $('#toast').textContent = ''; }, 6000);
}

function localize() {
  document.documentElement.lang = state.language;
  document.title = t('pageTitle');
  for (const element of document.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
  for (const element of document.querySelectorAll('[data-i18n-placeholder]')) element.placeholder = t(element.dataset.i18nPlaceholder);
  for (const element of document.querySelectorAll('[data-i18n-aria]')) element.setAttribute('aria-label', t(element.dataset.i18nAria));
  for (const button of document.querySelectorAll('[data-language]')) button.setAttribute('aria-pressed', String(button.dataset.language === state.language));
  clearTimeout(toastTimer);
  $('#toast').textContent = '';
  render();
  renderRoute();
}

function renderFilters() {
  const filters = $('#filters');
  filters.replaceChildren();
  filters.hidden = !state.data?.categories.length;
  const categories = [{id: 'all', label: {id: t('allCategories'), en: t('allCategories')}}, ...(state.data?.categories ?? [])];
  for (const category of categories) {
    const count = (state.data?.entries ?? []).filter(entry => category.id === 'all' || entry.category === category.id).length;
    const button = node('button', 'filter', `${category.label[state.language]}  ${count}`);
    button.type = 'button';
    button.dataset.category = category.id;
    button.setAttribute('aria-pressed', String(category.id === state.category));
    button.addEventListener('click', () => {
      state.category = category.id;
      for (const sibling of filters.children) sibling.setAttribute('aria-pressed', String(sibling === button));
      renderResults();
    });
    filters.append(button);
  }
}

function sourceLink(source) {
  const link = node('a', '', source.title);
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function render() {
  renderFilters();
  $('#load-error').hidden = !state.error;
  $('#retry').disabled = state.loading;
  if (state.data) {
    $('#verification-status').textContent = t(state.data.status === 'ready' ? 'readyStatus' : 'awaitingStatus');
    $('#research-note').textContent = state.data.researchNote[state.language];
    $('#last-reviewed').textContent = t('lastReviewed', {date: formatDate(state.data.reviewedAt, state.language)});
    $('#source-list').replaceChildren(...state.data.sources.map(source => {
      const item = node('div', 'source-item');
      item.append(sourceLink(source), node('p', '', source.note[state.language]));
      return item;
    }));
  } else {
    $('#verification-status').textContent = state.error ? t('loadErrorTitle') : t('loading');
    $('#research-note').textContent = '';
    $('#last-reviewed').textContent = '';
    $('#source-list').replaceChildren();
  }
  renderResults();
}

function renderResults() {
  $('#clear-search').hidden = !state.query;
  const entries = state.data?.entries ?? [];
  const visible = filterEntries(entries, state.query, state.category);
  const grid = $('#entry-grid');
  grid.replaceChildren(...visible.map(entry => {
    const card = node('article', 'entry-card');
    const preview = node('a', 'entry-preview');
    preview.href = entryHash(entry.id);
    preview.setAttribute('aria-label', `${t('viewDetail')}: ${entry.name}`);
    preview.addEventListener('click', rememberTrigger);
    const thumbnail = node('img');
    thumbnail.src = new URL(`.${entry.example.image}`, import.meta.url).href;
    thumbnail.alt = entry.example.alt[state.language];
    thumbnail.loading = 'lazy';
    thumbnail.width = 512;
    thumbnail.height = 512;
    preview.append(thumbnail);
    const body = node('div', 'entry-card-body');
    body.append(node('span', 'category-tag', state.data.categories.find(category => category.id === entry.category).label[state.language]));
    const heading = node('h3');
    const link = node('a', '', entry.name);
    link.href = entryHash(entry.id);
    link.addEventListener('click', rememberTrigger);
    heading.append(link);
    body.append(heading, node('p', '', entry.content[state.language].summary));
    const detail = node('a', 'card-link');
    detail.href = entryHash(entry.id);
    detail.setAttribute('aria-label', `${t('viewDetail')}: ${entry.name}`);
    detail.textContent = t('viewDetail');
    detail.addEventListener('click', rememberTrigger);
    body.append(detail, node('span', 'verified-tag', `${t('verified')} · ${formatDate(entry.verification.checkedAt, state.language)}`));
    card.append(preview, body);
    return card;
  }));
  $('#search').disabled = state.loading || state.error || !entries.length;
  $('#search-hint').hidden = state.loading || state.error || !!entries.length;
  $('#result-count').hidden = state.error;
  $('#result-count').textContent = state.loading ? t('loading') : t(state.query.trim() || state.category !== 'all' ? 'resultCount' : 'totalCount', {visible: visible.length, total: entries.length});
  $('#empty-state').hidden = state.loading || state.error || visible.length > 0;
  const hasEntries = entries.length > 0;
  const prefix = hasEntries ? 'noResults' : state.data?.status === 'awaiting-verification' ? 'awaiting' : 'empty';
  $('#empty-title').textContent = t(`${prefix}Title`);
  $('#empty-description').textContent = t(`${prefix}Description`);
  $('#verification-link').hidden = hasEntries;
  $('#reset-filters').hidden = !hasEntries;
}

function rememberTrigger(event) {
  // Preserve normal modified-click behavior for opening a shareable link in another tab.
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  detailTrigger = event.currentTarget;
  openedFromCatalog = event.currentTarget.hash;
}

function renderRoute() {
  const dialog = $('#entry-dialog');
  const id = parseEntryHash(location.hash);
  if (id === null) {
    openedFromCatalog = false;
    if (dialog.open) dialog.close();
    document.title = t('pageTitle');
    return;
  }
  if (state.loading) return;
  const content = $('#detail-content');
  copyGeneration++;
  content.replaceChildren();
  const entry = state.data?.entries.find(item => item.id === id);
  if (!entry) {
    const box = node('div', 'not-found');
    const heading = node('h2', '', t(state.error ? 'loadErrorTitle' : 'notFoundTitle'));
    heading.id = 'detail-title';
    box.append(heading, node('p', '', t(state.error ? 'loadError' : 'notFoundDescription')));
    const back = node('button', 'button secondary', t('backToCatalog'));
    back.type = 'button';
    back.addEventListener('click', closeDetail);
    box.append(back);
    content.append(box);
  } else {
    document.title = t('detailTitle', {name: entry.name});
    const localized = entry.content[state.language];
    const headingBox = node('div', 'detail-heading');
    const heading = node('h2', '', entry.name);
    heading.id = 'detail-title';
    headingBox.append(node('span', 'category-tag', state.data.categories.find(category => category.id === entry.category).label[state.language]), heading, node('p', 'detail-description', localized.summary));
    if (entry.access) headingBox.append(node('p', 'access-method', entry.access.label[state.language]));
    content.append(headingBox);
    const input = node('section', 'detail-section');
    input.append(node('h3', '', t('input')), node('p', 'detail-description', localized.input));
    content.append(input);
    const usage = node('section', 'detail-section');
    usage.append(node('h3', '', t('usage')));
    const steps = node('ol');
    steps.append(...localized.steps.map(step => node('li', '', step)));
    usage.append(steps);
    content.append(usage);
    const example = node('section', 'detail-section');
    example.append(node('h3', '', t('example')));
    const promptBox = node('div', 'sample-box');
    const promptLabel = node('div', 'sample-label');
    const copy = node('button', 'button secondary', t('copy'));
    copy.type = 'button';
    const currentGeneration = copyGeneration;
    copy.addEventListener('click', async () => {
      copy.disabled = true;
      try {
        await navigator.clipboard.writeText(localized.prompt);
        if (currentGeneration === copyGeneration) showToast('copied');
      } catch {
        if (currentGeneration === copyGeneration) showToast('copyFailed');
      } finally { copy.disabled = false; }
    });
    promptLabel.append(node('span', '', t('prompt')), copy);
    promptBox.append(promptLabel, node('p', 'sample-text', localized.prompt));
    const resultBox = node('div', 'sample-box');
    resultBox.append(node('div', 'sample-label', t('result')), node('p', 'sample-text', localized.result));
    const figure = node('figure', 'result-figure');
    const resultImage = node('img');
    resultImage.src = new URL(`.${entry.example.image}`, import.meta.url).href;
    resultImage.alt = entry.example.alt[state.language];
    resultImage.width = 1024;
    resultImage.height = 1024;
    figure.append(resultImage, node('figcaption', '', entry.example.note[state.language]));
    example.append(promptBox, figure, resultBox, node('p', 'illustration-note', t('resultNote')));
    content.append(example);
    if (entry.availability) {
      const availability = node('section', 'detail-section');
      availability.append(node('h3', '', t('availability')), node('p', 'detail-description', entry.availability[state.language]));
      content.append(availability);
    }
    const source = node('div', 'detail-source');
    source.append(node('span', '', t('entrySource')), node('p', '', `${t(entry.verification.method)} · ${formatDate(entry.verification.checkedAt, state.language)}`));
    source.append(...entry.verification.sources.map(sourceLink));
    source.append(node('p', '', entry.verification.note[state.language]));
    content.append(source);
  }
  if (!dialog.open) dialog.showModal();
}

function closeDetail() {
  if (openedFromCatalog === location.hash) {
    openedFromCatalog = false;
    history.back();
  } else {
    history.replaceState(null, '', `${location.pathname}${location.search}#catalog`);
    renderRoute();
  }
}

async function loadCatalog() {
  const generation = ++loadingGeneration;
  state.loading = true;
  state.error = false;
  render();
  try {
    const response = await fetch(document.body.dataset.catalogSource, {cache: 'no-cache'});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = validateCatalog(await response.json());
    if (generation !== loadingGeneration) return;
    state.data = data;
  } catch (error) {
    if (generation !== loadingGeneration) return;
    state.data = null;
    state.error = true;
    console.error('Catalog load failed:', error);
  }
  state.loading = false;
  render();
  renderRoute();
}

$('#search').addEventListener('input', event => { state.query = event.target.value; renderResults(); });
$('#clear-search').addEventListener('click', () => { state.query = ''; $('#search').value = ''; renderResults(); $('#search').focus(); });
$('#reset-filters').addEventListener('click', () => { state.query = ''; state.category = 'all'; $('#search').value = ''; renderFilters(); renderResults(); $('#search').focus(); });
$('#retry').addEventListener('click', loadCatalog);
for (const button of document.querySelectorAll('[data-language]')) {
  button.addEventListener('click', () => {
    state.language = button.dataset.language;
    try { localStorage.setItem(STORAGE_KEY, state.language); } catch { /* In-memory switching still works. */ }
    localize();
  });
}
$('#close-detail').addEventListener('click', closeDetail);
$('#entry-dialog').addEventListener('cancel', event => { event.preventDefault(); closeDetail(); });
$('#entry-dialog').addEventListener('close', () => {
  if (detailTrigger?.isConnected) detailTrigger.focus();
  else ($('#search').disabled ? $('.brand') : $('#search')).focus();
  detailTrigger = null;
});
window.addEventListener('hashchange', renderRoute);
document.addEventListener('keydown', event => {
  const target = event.target;
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey && !$('#entry-dialog').open && !target.closest('input, textarea, select, [contenteditable="true"]')) {
    event.preventDefault(); $('#search').focus();
  }
});
localize();
loadCatalog();
