# Dynamic Value Propagation Agent (DVPA)

## Vue d’ensemble

DVPA est un système expérimental de navigation et d’exploration autonome conçu pour des environnements en grille partiellement observables.

Le projet explore une approche alternative aux algorithmes classiques de recherche de chemin en combinant :

- propagation dynamique de valeurs,
- exploration adaptative,
- prise de décision sous contrainte énergétique,
- heuristiques de mémoire locale,
- et planification opportuniste de trajectoire.

Contrairement aux algorithmes de pathfinding traditionnels comme A*, qui calculent un chemin optimal vers un objectif connu dans une carte entièrement observable, l’agent découvre progressivement son environnement et adapte continuellement son comportement en fonction de son état interne et des informations disponibles localement.

Le système peut être vu comme une hybridation entre :
- recherche heuristique de chemin,
- champs de potentiel dynamiques,
- exploration autonome,
- et propagation légère de valeurs.

---

# Concepts fondamentaux

## Environnement partiellement observable

L’environnement est représenté par une grille 2D où chaque cellule peut contenir :

- un espace vide,
- un obstacle,
- une récompense.

L’agent ne possède initialement aucune connaissance globale de la carte et découvre progressivement les cellules voisines au cours de son exploration.

---

## Comportement adaptatif de l’agent

L’agent fonctionne selon deux modes comportementaux principaux.

### Mode Exploration

Lorsque son niveau d’énergie est suffisant, l’agent privilégie :
- la découverte de nouvelles zones,
- la limitation des revisites inutiles,
- l’expansion de sa connaissance de l’environnement.

### Mode Survie

Lorsque son énergie devient critique, l’agent adopte une stratégie orientée survie :
- priorisation des récompenses connues,
- réduction de l’exploration inutile,
- recherche efficace de ressources énergétiques.

Ce système crée un équilibre dynamique entre :
- exploration,
- exploitation,
- et survie.

---

# Propagation Dynamique de Valeur

Le système de navigation repose sur un champ de valeurs dynamiques.

Chaque récompense découverte émet un champ d’attraction dont l’influence décroît exponentiellement avec la distance.

Pour une récompense \( r \), la valeur propagée à une position \( s \) est approximativement définie par :

```math
V(s) = \gamma^{d(s,r)} \times R(r)
```

où :
- \( \gamma \) est le facteur de décroissance,
- \( d(s,r) \) est la distance de Manhattan,
- \( R(r) \) représente la valeur de la récompense.

La valeur finale d’une cellule correspond à l’influence maximale reçue :

```math
V_{final}(s) = \max_r(V_r(s))
```

Cela génère un gradient de navigation que l’agent peut suivre localement.

---

# Stratégie de navigation

Le système combine plusieurs heuristiques complémentaires.

## 1. Suivi de gradient local

L’agent tend à se déplacer vers les cellules voisines possédant les valeurs propagées les plus élevées.

---

## 2. Mémoire des visites

Les cellules déjà visitées accumulent un compteur de visites.

Ce mécanisme limite les comportements cycliques et réduit les risques de blocage local autour des obstacles.

Les pénalités de visite décroissent progressivement avec le temps afin de conserver une certaine capacité d’exploration.

---

## 3. Planification opportuniste

Lorsqu’une récompense est connue et que l’agent entre en mode survie, un planificateur léger basé sur une recherche en largeur (BFS) est utilisé pour construire un chemin atteignable vers la récompense connue la plus proche.

L’architecture combine ainsi :
- navigation réactive locale pendant l’exploration,
- planification explicite en situation critique.

---

# Découverte de l’environnement

L’agent ne perçoit que les cellules proches de sa position actuelle.

Les informations découvertes sont progressivement mémorisées :
- obstacles découverts,
- récompenses découvertes,
- positions déjà visitées.

L’environnement est donc effectivement partiellement observable.

---

# Caractéristiques actuelles

## Points forts

- Fonctionne dans des environnements inconnus.
- Système heuristique léger.
- Comportement adaptatif exploration/survie.
- Navigation dynamique sans connaissance complète de la carte.
- Comportements émergents intéressants.
- Architecture simple et extensible.

---

## Limites actuelles

L’implémentation actuelle reste expérimentale.

Limitations connues :
- la propagation ignore actuellement la topologie réelle des obstacles,
- des minima locaux peuvent apparaître dans certaines configurations complexes,
- la sélection des récompenses repose sur une distance géométrique et non sur un coût réel de chemin,
- aucune garantie d’optimalité globale,
- absence actuelle d’apprentissage par renforcement ou d’optimisation de politique.

---

# Comparaison avec les algorithmes classiques

| Algorithme | Carte complète requise | Objectif connu à l’avance | Exploration | Gestion énergie | Champ de valeur dynamique |
|---|---|---|---|---|---|
| A* | Oui | Oui | Non | Non | Non |
| Dijkstra | Oui | Oui | Non | Non | Non |
| Champs de potentiel | Généralement oui | Oui | Limité | Non | Oui |
| DVPA | Non | Non | Oui | Oui | Oui |

DVPA n’a pas vocation à remplacer les algorithmes optimaux de plus court chemin.

Le projet explore plutôt des stratégies de navigation autonome adaptées aux agents évoluant dans :
- des environnements incomplets,
- des contextes contraints en ressources,
- et des mondes découverts progressivement.

---

# Pistes d’amélioration

## Propagation sensible aux obstacles

Remplacer la propagation basée sur la distance Manhattan par une propagation tenant compte de la topologie réelle de l’environnement.

---

## Intégration d’apprentissage par renforcement

Permettre à l’agent d’adapter dynamiquement :
- ses stratégies d’exploration,
- ses seuils de survie,
- ses heuristiques de déplacement.

---

## Coordination multi-agents

Étendre le système vers :
- l’exploration coopérative,
- le partage de cartes,
- la découverte distribuée de ressources.

---

## Planification avancée

Intégration potentielle de :
- A*,
- D* Lite,
- Jump Point Search,
- ou méthodes hiérarchiques.

---

# Stack technique

- JavaScript
- HTML5 Canvas
- Simulation sur grille
- Rendu temps réel

---

# Orientation du projet

Ce projet constitue avant tout une expérimentation autour :
- de la navigation autonome,
- des heuristiques adaptatives,
- de la propagation dynamique de valeur,
- et du comportement d’agents sous contraintes énergétiques.

Il doit actuellement être considéré comme un prototype de recherche plutôt qu’un système de navigation prêt pour la production.

---

# Licence

MIT License
