/**
 * Module Utilitaires
 * Fonctions d'aide générique réutilisables dans toute l'application
 */

const Utils = {
  /**
   * Génère un identifiant unique basé sur le timestamp et des nombres aléatoires
   * @returns {string} Identifiant unique
   */
  uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  },

  /**
   * Retourne la date du jour au format ISO (YYYY-MM-DD)
   * @returns {string} Date du jour
   */
  today() {
    return new Date().toISOString().split('T')[0];
  },

  /**
   * Ajoute un nombre de mois à la date actuelle
   * @param {number} months - Nombre de mois à ajouter
   * @returns {string} Date future au format ISO (YYYY-MM-DD)
   */
  addMonths(months) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().split('T')[0];
  },

  /**
   * Calcule le nombre de jours entre aujourd'hui et une date donnée
   * @param {string} dateStr - Date au format ISO
   * @returns {number} Nombre de jours (9999 si date invalide)
   */
  daysUntil(dateStr) {
    if (!dateStr) return 9999;
    const d = new Date(dateStr);
    if (isNaN(d)) return 9999;
    return Math.ceil((d - new Date()) / 86400000);
  },

  /**
   * Formate une date ISO en format français (JJ/MM/AAAA)
   * @param {string} s - Date au format ISO
   * @returns {string} Date formatée ou '—' si invalide
   */
  fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s);
    if (isNaN(d)) return s;
    return d.toLocaleDateString('fr-FR');
  },

  /**
   * Échappe les caractères HTML pour éviter les injections XSS
   * @param {string} str - Chaîne à échapper
   * @returns {string} Chaîne sécurisée
   */
  esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Génère le HTML d'un badge de statut
   * @param {string} s - Statut (Actif, Inactif, Suspendu, En attente)
   * @returns {string} HTML du badge
   */
  statusBadge(s) {
    const map = {
      'Actif': 'actif',
      'Inactif': 'inactif',
      'Suspendu': 'suspendu',
      'En attente': 'attente'
    };
    return `<span class="badge badge-${map[s] || 'inactif'}">${s || '—'}</span>`;
  }
};
