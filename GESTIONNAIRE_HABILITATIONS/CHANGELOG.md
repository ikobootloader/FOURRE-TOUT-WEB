# Changelog

Historique des modifications du Gestionnaire d'Habilitations.

## [2.2.1] - 2026-05-07

### Corrections de bugs

#### Bouton "Nouveau registre vierge" non fonctionnel
- **[css/styles.css:340](css/styles.css#L340)** : Correction du z-index de `.modal-overlay` (500 → 1500)
- La modale de création de mot de passe s'affichait derrière le splash screen (z-index: 1000)
- **[js/app.js:421-447](js/app.js#L421-L447)** : Ajout de gestion d'erreurs avec try/catch dans les fonctions globales async
- Correction permet la création de nouveaux registres depuis l'écran de connexion

#### Statut de chiffrement incorrect dans les paramètres
- **[js/ui.js:468-491](js/ui.js#L468-L491)** : Implémentation de `renderSecurityPanel()`
- Affichage correct du statut de chiffrement (chiffré/non chiffré) dans l'onglet Paramètres
- Indication de la sauvegarde automatique quand un handle de fichier est actif

#### Mot de passe non demandé lors de l'ouverture via bouton "Ouvrir"
- **[js/app.js:168-222](js/app.js#L168-L222)** : Ajout de `promptPasswordForDecryption()` pour demander le mot de passe via modale
- Lors de l'ouverture d'un fichier .habil via le bouton "Ouvrir →", une modale demande maintenant le mot de passe
- Correction de l'erreur "Fichier trop court ou tronqué" lors du chargement

### Améliorations

#### Sauvegarde automatique optimisée avec persistence
- **[js/storage.js](js/storage.js)** : Nouveau module de stockage persistant avec IndexedDB
- **[js/files.js:108-133](js/files.js#L108-L133)** : Ajout de `openFileWithHandle()` utilisant `showOpenFilePicker`
- **[js/app.js](js/app.js)** : Persistence du handle de fichier entre les sessions
- Le handle de fichier est **sauvegardé dans IndexedDB** et restauré au chargement
- Le navigateur demande automatiquement confirmation via notification pour redonner les permissions
- **Plus besoin de resélectionner le fichier** à chaque connexion - le fichier reste lié
- Bouton "🔓 Délier ce fichier" pour supprimer le lien persistant si souhaité
- Sauvegarde automatique activée automatiquement lors de l'ouverture d'un fichier .habil

#### Interface
- **[gestion_habilitations.html:80](gestion_habilitations.html#L80)** : Icône de sauvegarde automatique changée (⇄ → ↻)
- Symbole de recyclage plus intuitif pour indiquer la sauvegarde en cours

## [2.2.0] - 2026-05-07

### Système de récupération par clé de sécurité

#### Clé de récupération automatique
- **Génération automatique** : Clé de 24 mots générée à la création de chaque registre
- **Format mnémonique** : 24 mots en français faciles à mémoriser ou écrire
- **Affichage obligatoire** : L'utilisateur doit confirmer avoir sauvegardé sa clé
- **Téléchargement sécurisé** : Fichier texte avec instructions de conservation
- **Copie presse-papiers** : Fonction de copie rapide intégrée

#### Protection double couche
- **Nouveau format HAB2** : Support de la clé de récupération
- **Rétrocompatibilité HAB1** : Lecture des anciens fichiers sans clé
- **Mot de passe chiffré** : Le mot de passe est stocké chiffré avec la clé de récupération
- **Récupération autonome** : Pas besoin de contact avec un support

#### Interface de récupération
- **Lien "Mot de passe oublié ?"** : Accessible depuis l'écran de chargement
- **Modale de saisie** : Interface claire pour saisir les 24 mots
- **Validation robuste** : Vérification du format et de la validité de la clé
- **Récupération automatique** : Le fichier se charge automatiquement après récupération

#### Sécurité renforcée
- **256 bits d'entropie** : Clé de récupération aussi sécurisée qu'un mot de passe fort
- **Chiffrement AES-GCM** : Protection cryptographique du mot de passe stocké
- **Pas de stockage** : La clé n'est jamais sauvegardée dans le navigateur
- **Wordlist française** : 256 mots soigneusement sélectionnés

#### Licence open source
- **Licence MIT** : Code open source sous licence permissive
- **Auteur** : Frédérick MURAT
- **Année** : 2026

## [2.1.0] - 2026-05-07

### Sécurité renforcée - Chiffrement obligatoire

#### Mot de passe obligatoire
- **Création de registre** : Mot de passe obligatoire (min. 8 caractères) à la création
- **Modale de mot de passe** : Interface dédiée avec confirmation et validation robuste
- **Mémorisation en mémoire** : Le mot de passe n'est jamais persisté, stocké uniquement en RAM

#### Chiffrement par défaut
- **Format .habil obligatoire** : Tous les nouveaux registres sont chiffrés en AES-256-GCM
- **Suppression de la toggle** : Le chiffrement n'est plus optionnel
- **Import Excel** : Les fichiers .xlsx peuvent être importés mais sont automatiquement chiffrés au premier enregistrement

#### Sauvegarde automatique via File System Access API
- **Rattachement de fichier** : L'utilisateur sélectionne l'emplacement du fichier .habil au démarrage
- **Sauvegarde asynchrone** : Enregistrement automatique en arrière-plan (debounce 2s)
- **Queue de sauvegarde** : Système de file d'attente pour éviter les conflits
- **Indicateur visuel** : Icône ⇄ animée dans le header pendant la sauvegarde
- **Fallback** : Téléchargement classique si File System Access API indisponible

#### Améliorations UX
- **Splash screen simplifié** : Message clair sur le chiffrement obligatoire
- **Champ mot de passe conditionnel** : Affiché uniquement pour les fichiers .habil
- **Export Excel non chiffré** : Fonction dédiée pour export d'audit en clair
- **Messages d'erreur explicites** : Retours clairs en cas d'échec de sauvegarde

## [2.0.1] - 2026-05-07

### Corrections de bugs

#### Erreurs JavaScript corrigées
- **[ui.js:117](js/ui.js#L117)** : Apostrophes non échappées dans les chaînes littérales (lignes 117, 234, 374)
- **[render.js:30](js/render.js#L30)** : Éléments DOM manquants pour les statistiques du dashboard
- **switchTab is not defined** : Fonction désormais correctement exposée globalement

#### Fonctions globales ajoutées
- Exposition de toutes les fonctions appelées depuis les gestionnaires onclick HTML
- `saveFile()`, `exportFile()`, `confirmDisconnect()` dans [js/app.js](js/app.js)
- `openAgentModal()`, `closeAgentModal()`, `saveAgent()` dans [js/ui.js](js/ui.js)
- `openHabilModal()`, `closeHabilModal()`, `addLogiciel()`, `addHabilLine()` dans [js/ui.js](js/ui.js)

#### Synchronisation HTML/JS
- Correction des IDs d'éléments DOM (`confirmMsg` vs `confirmMessage`, `habilLines` vs `habilLinesContainer`)
- Ajout de la structure HTML des cartes de statistiques dans le dashboard

## [2.0.0] - 2026-05-07

### Refactorisation majeure - Architecture modulaire

#### Structure
- **Séparation CSS** : Extraction complète dans [css/styles.css](css/styles.css)
- **Séparation JavaScript** : Code réorganisé en 8 modules distincts
- **Architecture propre** : Respect des principes Clean Code et SOLID

#### Modules créés
- **[js/utils.js](js/utils.js)** : Utilitaires généraux (dates, formatage, échappement HTML)
- **[js/data.js](js/data.js)** : Modèle de données centralisé avec API CRUD
- **[js/security.js](js/security.js)** : Cryptographie AES-256-GCM avec PBKDF2
- **[js/pagination.js](js/pagination.js)** : Gestionnaire de pagination réutilisable
- **[js/files.js](js/files.js)** : Import/Export Excel et fichiers chiffrés
- **[js/render.js](js/render.js)** : Rendu des tables, statistiques et dashboards
- **[js/ui.js](js/ui.js)** : Interface utilisateur (modales, toasts, navigation)
- **[js/app.js](js/app.js)** : Orchestrateur principal et initialisation

#### Bénéfices
- **Maintenabilité** : Code organisé par domaine métier
- **Lisibilité** : Séparation des responsabilités claire
- **Évolutivité** : Ajout de fonctionnalités facilité
- **Performance** : Pas d'impact, application toujours locale
- **Documentation** : Code entièrement commenté en français

## [1.1.0] - 2026-05-07

### Ajouté
- Pagination pour l'onglet Agents
- Pagination pour l'onglet Habilitations
- Pagination pour l'onglet Révisions
- Module de pagination réutilisable
- README.md avec documentation complète
- CHANGELOG.md pour suivi des versions

## [1.0.0] - Version initiale

### Fonctionnalités
- Gestion des agents (CRUD)
- Gestion des habilitations (CRUD)
- Système de révisions automatiques
- Alertes paramétrables
- Chiffrement AES-256
- Export/Import Excel
- Thème clair/sombre
- Interface responsive
