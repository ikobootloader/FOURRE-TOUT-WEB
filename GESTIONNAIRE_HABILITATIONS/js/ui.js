/**
 * Module d'Interface Utilisateur
 * Gestion des modales, toasts, navigation, thème
 */

const UI = {
  /**
   * Bascule le thème clair/sombre
   */
  toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', 'dark');
    try { localStorage.setItem('habil_theme', isDark ? 'light' : 'dark'); } catch (e) {}
  },

  /**
   * Change l'onglet actif
   * @param {string} tabName - Nom de l'onglet
   */
  switchTab(tabName) {
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    document.querySelector(`.nav-tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`page-${tabName}`)?.classList.add('active');
  },

  /**
   * Affiche un toast
   * @param {string} message - Message
   * @param {string} type - Type (success, error, info)
   */
  toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${Utils.esc(message)}</span>`;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  /**
   * Affiche une boîte de confirmation
   * @param {Object} options - {title, message, onConfirm}
   */
  confirm(options) {
    const overlay = document.getElementById('confirmOverlay');
    document.getElementById('confirmTitle').textContent = options.title || 'Confirmation';
    document.getElementById('confirmMsg').textContent = options.message || 'Êtes-vous sûr ?';

    overlay.classList.add('show');

    const onYes = () => {
      overlay.classList.remove('show');
      if (options.onConfirm) options.onConfirm();
    };

    document.getElementById('confirmBtn').onclick = onYes;
  },

  /**
   * Met à jour l'indicateur de sauvegarde
   */
  updateSaveIndicator() {
    const indicator = document.getElementById('saveIndicator');
    if (DataModel.state.unsaved) {
      indicator.textContent = '● Non sauvegardé';
      indicator.classList.remove('saved');
    } else {
      indicator.textContent = '✓ Sauvegardé';
      indicator.classList.add('saved');
    }
  },

  /**
   * Met à jour l'indicateur de sauvegarde automatique
   * @param {boolean} active - true si sauvegarde en cours
   */
  updateAutosaveIndicator(active) {
    const indicator = document.getElementById('autosaveIndicator');
    if (!indicator) return;

    if (active) {
      indicator.style.display = 'inline-block';
      indicator.classList.add('spinning');
    } else {
      // Garder visible 1s après la sauvegarde
      setTimeout(() => {
        indicator.classList.remove('spinning');
        setTimeout(() => {
          indicator.style.display = 'none';
        }, 1000);
      }, 500);
    }
  },

  /**
   * Met à jour l'indicateur de chiffrement
   */
  updateEncryptIndicator() {
    const indicator = document.getElementById('encryptIndicator');
    const file = DataModel.state.currentFile;

    if (!file) {
      indicator.innerHTML = '🔓 <span>Aucun fichier</span>';
      indicator.className = 'encrypt-indicator';
    } else if (file.endsWith('.habil')) {
      indicator.innerHTML = '🔒 <span>Chiffré</span>';
      indicator.className = 'encrypt-indicator locked';
    } else {
      indicator.innerHTML = '📄 <span>Non chiffré</span>';
      indicator.className = 'encrypt-indicator';
    }

    if (DataModel.state.pendingSecurityChange) {
      indicator.classList.add('pending');
    }
  },

  /**
   * Ouvre la modale agent
   * @param {string} agentId - ID de l'agent (null pour création)
   */
  openAgentModal(agentId = null) {
    DataModel.state.editingAgentId = agentId;
    const modal = document.getElementById('agentModalOverlay');
    const title = document.getElementById('agentModalTitle');

    if (agentId) {
      const agent = DataModel.getAgent(agentId);
      if (!agent) return;

      title.textContent = "Modifier l'agent";
      document.getElementById('aNom').value = agent.nom;
      document.getElementById('aPrenom').value = agent.prenom;
      document.getElementById('aEmail').value = agent.email;
      document.getElementById('aId').value = agent.id;
      document.getElementById('aService').value = agent.service;
      document.getElementById('aPoste').value = agent.poste;

      // Charger habilitations
      DataModel.state.agentHabilLines = DataModel.getAgentHabilitations(agentId).map(h => ({
        logicielId: h.logicielId,
        role: h.role,
        permissions: h.permissions,
        groupe: h.groupe || '',
        statut: h.statut,
        valideur: h.valideur || '',
        dateProchRevision: h.dateProchRevision,
        commentaires: h.commentaires || ''
      }));
    } else {
      title.textContent = 'Nouvel agent';
      document.getElementById('aNom').value = '';
      document.getElementById('aPrenom').value = '';
      document.getElementById('aEmail').value = '';
      document.getElementById('aId').value = '';
      document.getElementById('aService').value = '';
      document.getElementById('aPoste').value = '';
      DataModel.state.agentHabilLines = [];
    }

    this.populateAgentModalSelects();
    this.renderAgentHabilLines();
    modal.classList.add('show');
  },

  /**
   * Ferme la modale agent
   */
  closeAgentModal() {
    document.getElementById('agentModalOverlay').classList.remove('show');
  },

  /**
   * Sauvegarde l'agent depuis la modale
   */
  saveAgent() {
    const nom = document.getElementById('aNom').value.trim();
    const prenom = document.getElementById('aPrenom').value.trim();
    const email = document.getElementById('aEmail').value.trim();

    if (!nom || !prenom || !email) {
      this.toast('Veuillez remplir tous les champs obligatoires', 'error');
      return;
    }

    const agentData = {
      nom,
      prenom,
      email,
      service: document.getElementById('aService').value,
      poste: document.getElementById('aPoste').value
    };

    if (DataModel.state.editingAgentId) {
      // Mise à jour
      DataModel.updateAgent(DataModel.state.editingAgentId, agentData);

      // Supprimer anciennes habilitations et créer les nouvelles
      DataModel.habilitations = DataModel.habilitations.filter(h => h.agentId !== DataModel.state.editingAgentId);
      DataModel.state.agentHabilLines.forEach(line => {
        DataModel.addHabilitation({
          agentId: DataModel.state.editingAgentId,
          logicielId: line.logicielId,
          role: line.role,
          permissions: line.permissions,
          groupe: line.groupe,
          statut: line.statut,
          valideur: line.valideur,
          dateProchRevision: line.dateProchRevision,
          commentaires: line.commentaires
        });
      });
    } else {
      // Création
      const newId = Utils.uid();
      DataModel.addAgent({ id: newId, ...agentData });

      DataModel.state.agentHabilLines.forEach(line => {
        DataModel.addHabilitation({
          agentId: newId,
          logicielId: line.logicielId,
          role: line.role,
          permissions: line.permissions,
          groupe: line.groupe,
          statut: line.statut,
          valideur: line.valideur,
          dateProchRevision: line.dateProchRevision,
          commentaires: line.commentaires
        });
      });
    }

    this.closeAgentModal();
    DataModel.markUnsaved();
    Renderer.renderAll();
    this.updateSaveIndicator();
  },

  /**
   * Confirme la suppression d'un agent
   * @param {string} agentId - ID de l'agent
   */
  confirmDeleteAgent(agentId) {
    const agent = DataModel.getAgent(agentId);
    if (!agent) return;

    this.confirm({
      title: "Supprimer l'agent",
      message: `Supprimer définitivement ${agent.nom} ${agent.prenom} et toutes ses habilitations ?`,
      onConfirm: () => {
        DataModel.deleteAgent(agentId);
        DataModel.markUnsaved();
        Renderer.renderAll();
        this.updateSaveIndicator();
        this.toast('Agent supprimé', 'info');
      }
    });
  },

  /**
   * Valide une révision
   * @param {string} habilId - ID de l'habilitation
   */
  validateRevision(habilId) {
    const h = DataModel.getHabilitation(habilId);
    if (!h) return;

    h.dateDerniereValidation = Utils.today();
    h.dateDerniereModif = Utils.today();
    h.dateProchRevision = Utils.addMonths(DataModel.params.revisionPeriod);

    DataModel.markUnsaved();
    Renderer.renderRevisions();
    Renderer.renderStats();
    Renderer.updateRevBadge();
    this.updateSaveIndicator();
    this.toast(`Révision validée — prochaine révision dans ${DataModel.params.revisionPeriod} mois`, 'success');
  },

  /**
   * Peuple les selects de la modale agent
   */
  populateAgentModalSelects() {
    const svc = document.getElementById('aService');
    svc.innerHTML = '<option value="">— Choisir —</option>' + DataModel.params.services.map(s => `<option>${Utils.esc(s)}</option>`).join('');

    const poste = document.getElementById('aPoste');
    poste.innerHTML = '<option value="">— Choisir —</option>' + DataModel.params.postes.map(p => `<option>${Utils.esc(p)}</option>`).join('');
  },

  /**
   * Rend les lignes d'habilitation dans la modale agent
   */
  renderAgentHabilLines() {
    const container = document.getElementById('habilLines');
    container.innerHTML = DataModel.state.agentHabilLines.map((line, idx) => `
      <div class="habil-line">
        <div class="habil-line-header">
          <div class="habil-line-num">${idx + 1}</div>
          <div class="habil-line-title">Habilitation ${DataModel.getLogicielName(line.logicielId)}</div>
          <button class="habil-line-del" onclick="UI.removeAgentHabilLine(${idx})">✕</button>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">LOGICIEL</label>
            <select class="form-control" onchange="UI.updateAgentHabilLine(${idx}, 'logicielId', this.value)">
              ${DataModel.logiciels.map(l => `<option value="${l.id}" ${l.id === line.logicielId ? 'selected' : ''}>${Utils.esc(l.nom)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">RÔLE</label>
            <select class="form-control" onchange="UI.updateAgentHabilLine(${idx}, 'role', this.value)">
              <option value="">— Choisir —</option>
              ${DataModel.params.roles.map(r => `<option ${r === line.role ? 'selected' : ''}>${Utils.esc(r)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">PERMISSIONS</label>
            <select class="form-control" onchange="UI.updateAgentHabilLine(${idx}, 'permissions', this.value)">
              <option value="">— Choisir —</option>
              ${DataModel.params.permissions.map(p => `<option ${p === line.permissions ? 'selected' : ''}>${Utils.esc(p)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">GROUPE</label>
            <input type="text" class="form-control" value="${Utils.esc(line.groupe)}" onchange="UI.updateAgentHabilLine(${idx}, 'groupe', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">STATUT</label>
            <select class="form-control" onchange="UI.updateAgentHabilLine(${idx}, 'statut', this.value)">
              <option ${line.statut === 'Actif' ? 'selected' : ''}>Actif</option>
              <option ${line.statut === 'Inactif' ? 'selected' : ''}>Inactif</option>
              <option ${line.statut === 'Suspendu' ? 'selected' : ''}>Suspendu</option>
              <option ${line.statut === 'En attente' ? 'selected' : ''}>En attente</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">VALIDEUR</label>
            <input type="text" class="form-control" value="${Utils.esc(line.valideur)}" onchange="UI.updateAgentHabilLine(${idx}, 'valideur', this.value)">
          </div>
          <div class="form-group">
            <label class="form-label">DATE PROCHAINE RÉVISION</label>
            <input type="date" class="form-control" value="${line.dateProchRevision || ''}" onchange="UI.updateAgentHabilLine(${idx}, 'dateProchRevision', this.value)">
          </div>
        </div>
      </div>
    `).join('') + `<button class="add-habil-btn" onclick="UI.addAgentHabilLine()">＋ Ajouter une habilitation</button>`;
  },

  addAgentHabilLine() {
    if (DataModel.logiciels.length === 0) {
      this.toast('Aucun logiciel disponible', 'error');
      return;
    }
    DataModel.state.agentHabilLines.push({
      logicielId: DataModel.logiciels[0].id,
      role: '',
      permissions: '',
      groupe: '',
      statut: 'Actif',
      valideur: '',
      dateProchRevision: Utils.addMonths(DataModel.params.revisionPeriod),
      commentaires: ''
    });
    this.renderAgentHabilLines();
  },

  removeAgentHabilLine(idx) {
    DataModel.state.agentHabilLines.splice(idx, 1);
    this.renderAgentHabilLines();
  },

  updateAgentHabilLine(idx, field, value) {
    if (DataModel.state.agentHabilLines[idx]) {
      DataModel.state.agentHabilLines[idx][field] = value;
    }
  },

  // Autres méthodes similaires pour habilitations, paramètres, etc.
  // (à compléter selon besoin)

  openHabilModal(habilId = null) {
    this.toast('Modale habilitation en cours de développement', 'info');
  },

  confirmDeleteHabil(habilId) {
    this.confirm({
      title: "Supprimer l'habilitation",
      message: 'Supprimer définitivement cette habilitation ?',
      onConfirm: () => {
        DataModel.deleteHabilitation(habilId);
        DataModel.markUnsaved();
        Renderer.renderAll();
        this.updateSaveIndicator();
        this.toast('Habilitation supprimée', 'info');
      }
    });
  },

  removeParam(key, idx) {
    DataModel.params[key].splice(idx, 1);
    DataModel.markUnsaved();
    Renderer.renderSettings();
    this.updateSaveIndicator();
  },

  addParam(key, inputId) {
    const input = document.getElementById(inputId);
    const val = input.value.trim();
    if (!val) return;
    DataModel.params[key].push(val);
    input.value = '';
    DataModel.markUnsaved();
    Renderer.renderSettings();
    this.updateSaveIndicator();
  },

  updateLogicielName(id, name) {
    const log = DataModel.getLogiciel(id);
    if (log) {
      log.nom = name;
      DataModel.markUnsaved();
      this.updateSaveIndicator();
    }
  },

  deleteLogiciel(id) {
    DataModel.deleteLogiciel(id);
    DataModel.markUnsaved();
    Renderer.renderLogicielsEditor();
    Renderer.populateHabilFilters();
    Renderer.renderAll();
    this.updateSaveIndicator();
  },

  addValideur(logId) {
    const input = document.getElementById(`newValideur_${logId}`);
    const val = input.value.trim();
    if (!val) return;

    const log = DataModel.getLogiciel(logId);
    if (log) {
      if (!log.valideurs) log.valideurs = [];
      log.valideurs.push(val);
      input.value = '';
      DataModel.markUnsaved();
      Renderer.renderLogicielsEditor();
      this.updateSaveIndicator();
    }
  },

  removeValideur(logId, valideur) {
    const log = DataModel.getLogiciel(logId);
    if (log && log.valideurs) {
      log.valideurs = log.valideurs.filter(v => v !== valideur);
      DataModel.markUnsaved();
      Renderer.renderLogicielsEditor();
      this.updateSaveIndicator();
    }
  },

  renderSecurityPanel() {
    const file = DataModel.state.currentFile;
    const isEncrypted = file && file.endsWith('.habil');
    const hasHandle = DataModel.state.fileHandle !== null;

    const iconEl = document.getElementById('secStatusIcon');
    const titleEl = document.getElementById('secStatusTitle');
    const subEl = document.getElementById('secStatusSub');

    if (!file) {
      iconEl.textContent = '🔓';
      titleEl.textContent = 'Aucun fichier';
      subEl.textContent = 'Créez ou chargez un fichier pour commencer.';
    } else if (isEncrypted) {
      iconEl.textContent = '🔒';
      titleEl.textContent = 'Fichier chiffré (AES-256)';
      if (hasHandle) {
        subEl.textContent = `Sauvegarde automatique activée sur ${file}`;
      } else {
        subEl.textContent = `Fichier : ${file}`;
      }
    } else {
      iconEl.textContent = '📄';
      titleEl.textContent = 'Fichier non chiffré';
      subEl.textContent = `Fichier Excel en clair : ${file}`;
    }
  },

  /**
   * Affiche la modale de mot de passe
   * @param {Object} options - {title, message, isCreation, onConfirm, onCancel}
   */
  showPasswordModal(options) {
    const overlay = document.getElementById('passwordModalOverlay');
    if (!overlay) {
      console.error('Modale de mot de passe non trouvée');
      return;
    }

    document.getElementById('passwordModalTitle').textContent = options.title || 'Mot de passe';
    document.getElementById('passwordModalMessage').textContent = options.message || '';

    const pwd1 = document.getElementById('passwordInput1');
    const pwd2 = document.getElementById('passwordInput2');
    const pwd2Group = document.getElementById('passwordConfirmGroup');

    pwd1.value = '';
    pwd2.value = '';

    if (options.isCreation) {
      pwd2Group.style.display = 'block';
    } else {
      pwd2Group.style.display = 'none';
    }

    overlay.classList.add('show');

    const onValidate = () => {
      const p1 = pwd1.value;
      const p2 = pwd2.value;

      if (!p1) {
        this.toast('Le mot de passe ne peut pas être vide', 'error');
        return;
      }

      if (p1.length < 8) {
        this.toast('Le mot de passe doit contenir au moins 8 caractères', 'error');
        return;
      }

      if (options.isCreation && p1 !== p2) {
        this.toast('Les mots de passe ne correspondent pas', 'error');
        return;
      }

      overlay.classList.remove('show');
      if (options.onConfirm) options.onConfirm(p1);
    };

    const onCancelModal = () => {
      overlay.classList.remove('show');
      if (options.onCancel) options.onCancel();
    };

    document.getElementById('passwordModalConfirm').onclick = onValidate;
    document.getElementById('passwordModalCancel').onclick = onCancelModal;

    // Enter pour valider
    const enterHandler = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onValidate();
      }
    };
    pwd1.onkeydown = enterHandler;
    pwd2.onkeydown = enterHandler;
  }
};

// Fonctions globales pour compatibilité onclick
function toggleTheme() { UI.toggleTheme(); }
function switchTab(tab) { UI.switchTab(tab); }
function openAgentModal(id) { UI.openAgentModal(id); }
function closeAgentModal() { UI.closeAgentModal(); }
function saveAgent() { UI.saveAgent(); }
function openHabilModal(id) { UI.openHabilModal(id); }
function closeHabilModal() {
  document.getElementById('habilModalOverlay').classList.remove('show');
}
function saveHabil() {
  UI.toast('Fonction de sauvegarde habilitation en cours de développement', 'info');
}
function closeConfirm() {
  document.getElementById('confirmOverlay').classList.remove('show');
}
function addParam(key, inputId) { UI.addParam(key, inputId); }
function addHabilLine() { UI.addAgentHabilLine(); }
function onHabilLogicielChange() {
  // Suggestion de valideurs selon le logiciel sélectionné
  const logId = document.getElementById('hLogiciel')?.value;
  if (!logId) return;
  const log = DataModel.getLogiciel(logId);
  if (log && log.valideurs && log.valideurs.length > 0) {
    const suggest = document.getElementById('hValideurSuggest');
    if (suggest) {
      suggest.textContent = 'Valideurs suggérés : ' + log.valideurs.join(', ');
    }
  }
}
function addLogiciel() {
  const nom = prompt('Nom du logiciel :');
  if (!nom || !nom.trim()) return;
  DataModel.addLogiciel({ nom: nom.trim(), valideurs: [] });
  DataModel.markUnsaved();
  Renderer.renderLogicielsEditor();
  Renderer.populateHabilFilters();
  UI.updateSaveIndicator();
}
