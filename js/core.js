/* AlaricCode V2 — utilitaires communs et accès données (Firebase). */
(function (global) {
  'use strict';
  const CATALOGUE_FILES = Object.freeze([
    Object.freeze({ filename: 'data/catalogue.json', source: 'alaric', label: 'Sélection d’Alaric' }),
    Object.freeze({ filename: 'data/catalogue-item-de-base.json', source: 'base', label: 'Catalogue de base' })
  ]);
  function escapeHTML(value) {
    return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;');
  }
  function normalize(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  }
  function formatPrice(value) {
    const n = Number(value); return `${Number.isFinite(n) ? n.toLocaleString('fr-FR') : '0'} PA`;
  }
  function createStockClient() {
    if (!global.AlaricFirebase?.client) {
      throw new Error('La connexion Firebase est absente. Vérifie les scripts du fichier HTML.');
    }
    return global.AlaricFirebase.client;
  }
  async function fetchJSON(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Impossible de charger ${url} (HTTP ${response.status}).`);
    try { return await response.json(); } catch { throw new Error(`${url} contient un JSON invalide.`); }
  }
  // Alias temporaire : app.js et stock.js peuvent continuer à fonctionner sans refonte.
  global.AlaricCore = Object.freeze({ CATALOGUE_FILES, escapeHTML, normalize, formatPrice,
    createStockClient, createSupabaseClient: createStockClient, fetchJSON });
}(window));
