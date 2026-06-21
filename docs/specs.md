S P É C I F I C AT I O N S T E C H N I Q U E S
PURSIO
Dossier d'Architecture, Cas d'Utilisation et Spécifications
Fonctionnelles Détaillées
Projet : Application Mobile Pursio (Gestion Financière)
Statut : Cahier des Charges Opérationnel & Technique
Devise Pivot : Franc CFA (XOF / XAF)
Architecture : Kotlin Multiplatform (KMP) & Offline-First
Version : 1.0.0 (Windows/iOS Cross-Compile Target)
Date : Juin 2026
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 1
1. VISION STRATÉGIQUE & CONTEXTE
MÉTIER
1.1 Introduction et Positionnement
Pursio est une solution de gestion financière personnelle de rupture, spécifiquement calibrée pour les réalités
socio-économiques de la zone Afrique de l'Ouest et Centrale (utilisant le Franc CFA comme devise pivot).
Contrairement aux solutions de comptabilité traditionnelles occidentales axées exclusivement sur le tracking
passif des dépenses, Pursio introduit une approche psychologique inversée : l'alignement systématique de la
liquidité disponible avec des projets de vie concrets (épargne active finalisée).
L'application cible en priorité les jeunes actifs, les indépendants et les cadres dynamiques évoluant dans des
écosystèmes où les flux financiers sont hautement fragmentés entre le numéraire (Cash) et les services de
Mobile Money (Wave, Orange Money, Moov, MTN).
1.2 Contraintes Monétaires et Spécificités FCFA
Le choix du Franc CFA (XOF/XAF) impose des règles strictes au niveau du moteur de calcul et de la couche
de présentation UI :
Absence de décimales : Le FCFA est une monnaie non décimale en pratique quotidienne. Le système
doit forcer l'utilisation d'entiers ou de structures de données monétaires rigides (ex: type Long ou
structures de type BigDecimal sans virgule) pour éviter toute erreur d'arrondi flottant inhérente aux types
primitifs Double ou Float.
Grands Volumes Nominaux : Les montants cibles de projets atteignent rapidement des valeurs
nominales élevées (ex: 2 500 000 FCFA pour l'achat de matériel ou un voyage). L'interface utilisateur doit
intégrer des formateurs de texte optimisés pour la lisibilité (séparateurs de milliers d'espace fin non
cassant).
Note sur l'écosystème de développement cible
Le projet est initié sur un environnement hôte Windows avec pour objectif final un déploiement natif sur
Apple iPhone (iOS). Cette contrainte technique majeure dicte l'ensemble des choix d'architecture
logicielle détaillés dans ce document, notamment l'utilisation de Kotlin Multiplatform combiné à des
pipelines de compilation distants.
•
•
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 2
2. SPÉCIFICATIONS FONCTIONNELLES (USER
STORIES)
2.1 Structuration : La Règle des 3 Cercles
La taxonomie des transactions dans Pursio abandonne le modèle classique par catégories infinies
(alimentation, transport, etc.) au profit d'une sectorisation macro-économique comportementale appelée "La
Règle des 3 Cercles" :
1. Cercle Vital
Charges incompressibles et
obligatoires : Loyer, factures
d'eau/électricité (CEET, SBEE,
etc.), alimentation de
subsistance, frais de transport
professionnels.
2. Cercle Croissance
Cœur applicatif de Pursio. Flux
dédiés au financement des
projets actifs, à la constitution
du fonds de précaution, et aux
investissements générateurs de
valeur.
3. Cercle Plaisir
Dépenses discrétionnaires,
loisirs, restaurants, achats
impulsifs. Ce cercle est
monitoré de manière restrictive
par le moteur d'alertes.
2.2 Liste des User Stories Spécifiques
US #01 — Initialisation du Profil & Calcul du Minimum Vital
En tant qu' utilisateur de Pursio lors de ma première ouverture de l'application,
Je veux déclarer mes sources de revenus récurrentes et mes charges incompressibles du Cercle Vital,
Afin que l'application puisse isoler automatiquement ma capacité d'épargne théorique mensuelle.
US #02 — Allocation de Projet & Verrouillage du Coussin de Précaution
En tant qu' épargnant soucieux de ma stabilité financière,
Je veux que l'application bloque la création de projets non essentiels (Plaisir) tant que mon Épargne de
Précaution Locale (égale à 3 mois de Cercle Vital) n'est pas intégralement constituée,
Afin de me prémunir des ruptures de trésorerie face aux aléas de la vie quotidienne.
US #03 — Saisie de Transaction en Mode Hors-Ligne Total
En tant qu' utilisateur en déplacement avec une connectivité réseau instable ou inexistante,
Je veux pouvoir enregistrer immédiatement une dépense Mobile Money ou Cash sur mon téléphone,
Afin que mes soldes soient mis à jour instantanément en local sans générer d'erreur de timeout ou d'écran
de blocage.
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 3
US #04 — Alerte Prédictive d'Impact d'Achat Plaisir
En tant qu' utilisateur sur le point d'effectuer une dépense imprévue dans le Cercle Plaisir,
Je veux saisir le montant avant de payer pour voir l'impact exact sur la date de réalisation de mon projet actif,
Afin de prendre une décision d'achat rationnelle et consciente.
3. CAS D'UTILISATION & WORKFLOWS DE
DONNÉES
3.1 Matrice Globale des Cas d'Utilisation (Use Cases)
ID TITRE DU CAS ACTEUR PRÉ-CONDITIONS POST-CONDITIONS
UC-01 Saisie Flux Entrant Utilisateur App active, base de
données locale
initialisée.
Montant ventilé, solde
local mis à jour, trigger
de synchronisation en
attente.
UC-02 Calcul Épargne Sécurité Moteur Core Mise à jour des
dépenses du Cercle
Vital.
Nouveau seuil de
verrouillage mis à jour
dynamiquement.
UC-03 Simulation Dépense
Plaisir
Utilisateur Au moins un projet actif
présent dans la table
locale.
Rapport d'impact
calculé (nombre de
jours de retard ajoutés
au projet).
UC-04 Réconciliation Cloud Sync
Manager
Réseau détecté, token
JWT valide.
File d'attente locale
vidée, base distante
synchronisée.
3.2 Workflow Détaillé : Enregistrement d'un flux et impact
algorithmique
Le diagramme séquentiel textuel suivant décrit le parcours logique d'une transaction saisie hors-ligne :
L'utilisateur initie l'action via l'interface UI (Compose Multiplatform). Il sélectionne le montant (ex : 5 000
FCFA), la source (ex : Mobile Money - Wave) et le Cercle de destination (Plaisir).
1.
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 4
La couche UI Layer transmet le DTO (Data Transfer Object) au TransactionViewModel.
Le ViewModel interroge le FinancialCoreEngine pour évaluer l'impact sur le projet actif si le cercle choisi
est "Plaisir".
Le FinancialCoreEngine exécute l'algorithme prédictif (voir section 5) et retourne le nombre de jours de
décalage. L'UI affiche une alerte contextuelle de validation.
Dès validation, le LocalRepository insère la ligne dans la base SQLite via SQLDelight. Le solde de
l'écran d'accueil s'ajuste en t = 0.
Le SyncBackgroundWorker enregistre un ID de réconciliation dans la table locale des mutations en
attente.
4. ARCHITECTURE TECHNIQUE & PIPELINE
WINDOWS-TO-IOS
4.1 Choix de l'Écosystème : Kotlin Multiplatform (KMP)
Pour maximiser le partage de code tout en garantissant des performances d'exécution natives et une
conformité stricte avec les guides d'interface d'Apple, le projet adopte Kotlin Multiplatform.
La logique métier, le moteur de calcul des cercles, la persistance des données et la gestion de la
synchronisation réseau sont localisés à 100% dans le module partagé (shared module). L'interface graphique
est implémentée en Compose Multiplatform pour un rendu pixel-perfect unifié, compilé de manière native
pour les cibles Android (JVM) et iOS (via Kotlin/Native convertissant le code en frameworks natifs Apple
LLVM).
4.2 Pipeline de Cross-Compilation depuis Windows
La contrainte d'un environnement de développement principal sous Windows impose l'externalisation de la
chaîne de compilation Apple Xcode (indispensable pour l'obtention des binaires iOS signés). Deux
architectures de build sont retenues pour le cycle de vie de Pursio :
2.
3.
4.
5.
6.
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 5
Option A : Pipeline d'Intégration Continue (CI/CD via GitHub Actions)
Chaque commit poussé sur la branche develop ou main déclenche un workflow GitHub Actions
s'exécutant sur un runner hébergé sous macOS. Ce runner exécute la tâche Gradle Gradle
puis compile l'application via Xcode CLI pour générer un fichier IPA. Le build est automatiquement
poussé vers Apple TestFlight pour mise à disposition immédiate sur l'iPhone de test de l'utilisateur.
Option B : Environnement Distant Synchrone (MacinCloud / SSH Remote)
Pour les phases de débogage actif de la couche de liaison iOS, un serveur Mac distant est loué. Depuis
IntelliJ IDEA sous Windows, le plugin de déploiement distant exécute les scripts de build via une
passerelle SSH sécurisée, simulant un environnement local pour le développeur.
4.3 Stratégie d'Architecture "Offline-First"
Le mode déconnecté n'est pas traité comme une fonctionnalité secondaire, mais comme l'état nominal de
l'application. La source unique de vérité (Single Source of Truth) est la base de données locale.
COUCHE UI (COMPOSE)
⬇ Repositories / UseCases (Shared Module)
SQLDelight Cache Local (SQLite)
⬇ Ktor HTTP Client (Uniquement si réseau OK)
Serveur distant Cloud (PostgreSQL / API REST)
:shared:linkReleaseFrameworkIosArm64
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 6
5. MODÈLES DE DONNÉES & ALGORITHMES
CLÉS
5.1 Schéma SQLDelight (Persistance Locale)
Voici la déclaration structurelle du schéma de base de données qui sera compilé en code Kotlin fortement
typé pour les deux plateformes :
5.2 Classes de Données Kotlin Partagées
Représentation des entités logicielles au sein du Core en Kotlin :
-- src/commonMain/sqldelight/database/PursioDb.sq
CREATE TABLE TransactionEntity (
id TEXT NOT NULL PRIMARY KEY,
montant LONG NOT NULL, -- Stockage en centimes ou valeur nominale entière FCFA
cercle TEXT NOT NULL, -- VITAL, CROISSANCE, PLAISIR
source TEXT NOT NULL, -- CASH, WAVE, ORANGE_MONEY, MOOV, MTN
description TEXT,
timestamp LONG NOT NULL,
isSynced INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE ProjetEntity (
id TEXT NOT NULL PRIMARY KEY,
nom TEXT NOT NULL,
montantCible LONG NOT NULL,
montantAlloue LONG NOT NULL DEFAULT 0,
dateEcheanceCalculer TEXT NOT NULL,
priorite INTEGER NOT NULL
);
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 7
5.3 Algorithme Mathématique d'Épargne de Précaution Locale
La formule de calcul du fonds de sécurité minimal obligatoire (Fsécurité) s'énonce comme suit. Soit Dvital(m)
l'ensemble des dépenses enregistrées sous le tag CercleFinancier.VITAL au cours du mois m :
Fsécurité = 3 × ∑(i=1 à N) Dvital(i) / N
Où N est le nombre de mois d'historique de l'utilisateur (borné par défaut à N = 3 pour stabiliser la moyenne
glissante). Tant que le solde total des comptes d'épargne liquide de l'utilisateur est inférieur à Fsécurité, tout
flux entrant est obligatoirement fléché vers la table de l'épargne de précaution, et le système lève une
exception de validation visuelle si l'utilisateur tente de transférer de l'argent vers un projet optionnel.
package com.pursio.core.domain.model
enum class CercleFinancier { VITAL, CROISSANCE, PLAISIR }
enum class SourceLiquidite { CASH, WAVE, ORANGE_MONEY, MOOV, MTN }
data class FinancialTransaction(
val id: String,
val montantFCFA: Long,
val cercle: CercleFinancier,
val source: SourceLiquidite,
val description: String?,
val timestampMs: Long,
val isSynced: Boolean
)
data class LifeProject(
val id: String,
val nom: String,
val montantCibleFCFA: Long,
var montantAlloueFCFA: Long,
val dateLimiteOptionnelle: String?,
val prioriteOrdre: Int
)
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 8
6. STORYBOOK, SPÉCIFICATIONS UI &
DESIGN SYSTEM
6.1 Identité Visuelle (Inspirée de la charte Caleo Pay)
L'interface utilisateur de Pursio applique un contraste radical de type "Fintech de rupture" pour instaurer une
sensation de précision et de modernité absolue. Les choix chromatiques et stylistiques stricts sont consignés
dans le tableau ci-dessous :
ÉLÉMENT DE
DESIGN CODE COULEUR / RÈGLE COMPORTEMENT ET APPLICATION UI
Background Principal ■ #050505 (Noir Absolu) Appliqué sur l'ensemble des fenêtres. Évite la
fatigue oculaire et maximise le contraste des
KPIs.
Accent Primaire ■ #DCFD8B (Neon Lime) Utilisé pour les éléments interactifs majeurs
(boutons CTA, barres de progression de
projets, chiffres clés).
Surfaces Secondaires ■ #121212 / #1A1A1A Couleur des conteneurs de listes, des lignes de
transactions et des cartes de projets.
Bords de Formes Radius : 12dp / 16dp Aucun angle droit vif pour conserver un aspect
organique premium.
Typographie Titres Font : Outfit (Bold) Interlettrage réduit (-1px ou -2px) pour un
impact visuel lourd et affirmé.
6.2 Guide des Composants Atomiques (Storybook Spec)
Chaque composant UI développé dans Compose Multiplatform doit se conformer aux états d'affichage
suivants pour garantir la cohérence :
Composant 1 : Le Bouton d'Action Principal (CTA Button)
État Nominal : Fond couleur `#DCFD8B`, texte en noir absolu `#000000`, police Outfit en majuscules
grasses.
•
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 9
État Pressé / Focus : Opacité réduite à 80% de la couleur Neon Lime, fine bordure blanche d'accent
externe.
État Désactivé (Verrouillé par les règles métier) : Fond gris foncé `#2A2A2A`, texte gris sourd
`#666666`. Une icône de cadenas cadrait le texte à gauche si le blocage provient de l'absence du fonds
de sécurité.
Composant 2 : La Jauge des Cercles Concentriques
Ce composant graphique personnalisé affiche trois arcs de cercles imbriqués sur l'écran d'accueil. L'arc
externe (Cercle Vital) s'épaissit et passe du blanc au rouge si le budget mensuel alloué est dépassé de plus
de 5%. L'arc intermédiaire (Croissance) émet une animation d'impulsion lumineuse (Glow effect Neon Lime) à
chaque fois qu'une transaction positive y est rattachée, renforçant positivement le comportement d'épargne
de l'utilisateur.
Validation et Signature du Document
Ce document de spécifications constitue la référence unique pour l'implémentation de la version MVP de
l'application Pursio. Toute modification des règles métier (notamment les règles de calcul de l'épargne ou les
structures de données SQL) devra faire l'objet d'un avenant technique et d'une incrémentation de la version
majeure du schéma de base de données.
•
•
PURSIO — Spécifications Techniques & Fonctionnelles V1.0 10