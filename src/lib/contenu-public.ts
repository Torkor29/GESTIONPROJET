/**
 * Catalogue des pages publiques substantielles.
 *
 * Objectif : un site lisible par un humain *et* par un filtre d'entreprise
 * qui juge un site « trop pauvre » dès qu'il ne voit qu'une landing et un
 * formulaire de connexion. Chaque article a un texte unique, en français,
 * sans copier-coller d'un autre.
 */

export const CATEGORIES = [
  "metiers",
  "guides",
  "cas-usage",
  "actualites",
  "ressources",
] as const;

export type CategorieArticle = (typeof CATEGORIES)[number];

export const LIBELLES_CATEGORIE: Record<CategorieArticle, string> = {
  metiers: "Métiers",
  guides: "Guides",
  "cas-usage": "Cas d'usage",
  actualites: "Articles",
  ressources: "Ressources",
};

export const CHEMINS_CATEGORIE: Record<CategorieArticle, string> = {
  metiers: "/metiers",
  guides: "/guides",
  "cas-usage": "/cas-usage",
  actualites: "/actualites",
  ressources: "/ressources",
};

export type BlocArticle =
  | { type: "p"; texte: string }
  | { type: "h2"; texte: string }
  | { type: "ul"; items: string[] }
  | { type: "note"; titre?: string; texte: string };

export type ArticlePublic = {
  slug: string;
  categorie: CategorieArticle;
  titre: string;
  description: string;
  surtitre: string;
  resume: string;
  date?: string;
  corps: BlocArticle[];
};

export function cheminArticle(article: ArticlePublic): string {
  return `${CHEMINS_CATEGORIE[article.categorie]}/${article.slug}`;
}

export function articlesDe(categorie: CategorieArticle): ArticlePublic[] {
  return ARTICLES.filter((a) => a.categorie === categorie);
}

export function articleParSlug(
  categorie: CategorieArticle,
  slug: string,
): ArticlePublic | undefined {
  return ARTICLES.find((a) => a.categorie === categorie && a.slug === slug);
}

export function tousLesArticles(): ArticlePublic[] {
  return ARTICLES;
}

const ARTICLES: ArticlePublic[] = [
  // ------------------------------------------------------------------ métiers
  {
    slug: "chef-de-projet",
    categorie: "metiers",
    titre: "Le chef de projet clinique dans Vigie",
    description:
      "Comment un chef de projet hospitalier pilote un portefeuille d'études : jalons, risques, charge d'équipe, reporting, sans se substituer à l'EDC du promoteur.",
    surtitre: "Métiers",
    resume:
      "Vue portefeuille, jalons réglementaires, alertes critiques et charge de l'équipe — le tableau de bord de qui doit répondre « où en est l'étude ».",
    corps: [
      {
        type: "p",
        texte:
          "Le chef de projet clinique n'a pas besoin d'un écran de saisie patient. Il a besoin de savoir, en quelques minutes, quelles études avancent, lesquelles coincen, et ce qui va manquer à la prochaine réunion de suivi. Vigie lui donne une vue de portefeuille : statut de chaque étude, jalons à venir, queries critiques, visites de monitoring en retard, documents TMF expirants.",
      },
      {
        type: "p",
        texte:
          "Dans un CHU, le même chef de projet suit souvent à la fois des essais industriels, des recherches académiques promotion interne, et des investigations sur dispositif médical. Les circuits d'autorisation ne sont pas les mêmes. Les interlocuteurs non plus. L'outil ne fusionne pas ces réalités : chaque étude porte son cadre (RIPH, règlement 536/2014, MDR, IVDR) et ses checklists correspondantes.",
      },
      { type: "h2", texte: "Ce que le rôle voit en priorité" },
      {
        type: "ul",
        items: [
          "Le portefeuille : acronymes, promoteurs, dates de première inclusion et de clôture prévue.",
          "Les jalons : soumission CTIS ou CPP, premier patient, database lock, CSR.",
          "Les risques : centre en difficulté, query ouverte depuis trop longtemps, écart majeur non clos.",
          "La charge : temps saisi par l'équipe, missions en retard, documents à renouveler.",
        ],
      },
      {
        type: "p",
        texte:
          "Le chef de projet peut être super-administrateur de l'instance, mais ce n'est pas automatique. Sur une étude, il invite l'ARC, le data manager, parfois l'investigateur. Les droits sont appliqués côté serveur : masquer un bouton dans l'interface ne crée pas une permission.",
      },
      { type: "h2", texte: "Ce que ce rôle ne fait pas dans l'outil" },
      {
        type: "p",
        texte:
          "Il ne saisit pas les données cliniques du cahier d'observation. Il ne déclare pas un SAE à l'autorité compétente. Il ne signe pas électroniquement un consentement. Vigie reste un outil de conduite de projet. Le reporting qu'il produit sert les réunions internes, pas un dossier de soumission tel quel.",
      },
      {
        type: "note",
        titre: "À retenir",
        texte:
          "Si la question du lundi matin est « qu'est-ce qui bloque AURORA ? », le chef de projet doit pouvoir ouvrir le tableau de bord, pas reconstruire un tableur à partir de trois boîtes mail.",
      },
    ],
  },
  {
    slug: "arc",
    categorie: "metiers",
    titre: "L'attaché de recherche clinique (ARC) dans Vigie",
    description:
      "Centres, visites de monitoring, écarts, lettres de suivi et actions correctives : le quotidien de l'ARC hospitalier dans un outil de clinical operations.",
    surtitre: "Métiers",
    resume:
      "Centres, visites de mise en place, de routine et de clôture, écarts et CAPA — le fil de l'ARC, distinct des visites protocolaires du sujet.",
    corps: [
      {
        type: "p",
        texte:
          "L'ARC suit des centres, pas des lignes de tableur. Chaque centre a un investigateur, un statut (sélectionné, initié, recrutant, suspendu, clos), un objectif d'inclusions, parfois un contact technique. La visite de monitoring n'est pas la visite V2 du sujet : c'est une visite de mise en place, de routine, de clôture ou à distance, avec une date prévue, une date réalisée et une lettre de suivi.",
      },
      {
        type: "p",
        texte:
          "Sur le terrain, l'ARC prépare la visite (documents à relire, queries ouvertes du centre, déviations encore ouvertes), la réalise, rédige le compte rendu, puis relance les actions. Vigie ne remplace pas le rapport de monitoring du promoteur lorsqu'il existe. Il évite que le suivi interne de l'établissement tienne dans une messagerie personnelle.",
      },
      { type: "h2", texte: "Le fil de travail" },
      {
        type: "ul",
        items: [
          "Liste des centres de l'étude, filtrable par statut et par risque.",
          "Calendrier des visites de monitoring, en retard ou à planifier.",
          "Écarts constatés : gravité, impact, actions associées.",
          "Documents du centre : conventions, délégations, formations, dates d'expiration.",
        ],
      },
      {
        type: "p",
        texte:
          "Un centre « en difficulté » n'est pas un jugement : c'est un signal. Recrutement à l'arrêt, queries accumulées, visite reportée deux fois, investigateur absent. Le chef de projet voit le même signal depuis le portefeuille. L'ARC, lui, voit le détail et les actions.",
      },
      { type: "h2", texte: "Monitoring et data management" },
      {
        type: "p",
        texte:
          "L'ARC n'est pas le data manager, mais leurs objets se croisent. Une query ouverte sur un sujet du centre apparaît dans la fiche centre. Une déviation relevée en visite peut engendrer une CAPA. Le workflow des queries (ouverte, répondue, rouverte, résolue, fermée) reste du ressort du data management ; l'ARC s'en sert comme d'un indicateur de qualité du centre.",
      },
      {
        type: "note",
        titre: "Vocabulaire",
        texte:
          "« Visite de monitoring » et « visite protocolaire » sont deux listes distinctes dans Vigie. Les confondre produit des plannings illisibles et des indicateurs faux.",
      },
    ],
  },
  {
    slug: "data-manager",
    categorie: "metiers",
    titre: "Le data manager clinique dans Vigie",
    description:
      "Queries, revue de données, CRF, coding, jalons de gel de base : le poste de travail du data manager hospitalier, sans remplacer l'EDC du promoteur.",
    surtitre: "Métiers",
    resume:
      "Queries historisées, revue de données, structure CRF et jalons de data management — pour répondre « qu'est-ce qui manque avant le lock ».",
    corps: [
      {
        type: "p",
        texte:
          "Le data manager doit pouvoir répondre, sans reconstruire un export, à trois questions : quelles queries sont ouvertes, quelles données restent à revoir, quels contrôles bloquent le prochain jalon. Vigie n'est pas l'EDC. Il décrit la structure du CRF (formulaires, variables, contraintes) pour y rattacher les queries et la revue. La saisie clinique reste dans le système du promoteur ou de la plateforme institutionnelle.",
      },
      {
        type: "p",
        texte:
          "Une query a un cycle de vie : ouverte, répondue, éventuellement rouverte, résolue, fermée. Chaque transition est historisée (qui, quand, commentaire). Tant qu'elle n'est pas résolue ou fermée, elle compte dans les indicateurs. On ne « disparaît » pas une query en la supprimant pour faire joli le vendredi.",
      },
      { type: "h2", texte: "Objets du quotidien" },
      {
        type: "ul",
        items: [
          "Queries : texte, gravité, sujet, visite, variable, historique.",
          "Revue de données : listes de contrôle, statuts, commentaires.",
          "Coding : suivi des termes médicaux à coder, sans prétendre être un dictionnaire MedDRA.",
          "DMP : version, date, responsable, statut de validation du plan de data management.",
          "Jalons : freeze, lock, livraisons d'export.",
        ],
      },
      {
        type: "p",
        texte:
          "Le data manager voit les sujets par Subject ID, jamais par nom. Si une équipe a besoin d'une table de correspondance nominative, elle vit dans le centre, sous la responsabilité de l'investigateur, pas dans Vigie.",
      },
      { type: "h2", texte: "Avant le database lock" },
      {
        type: "p",
        texte:
          "Le lock n'est pas un bouton magique de conformité. C'est un jalon de projet : queries fermées, écarts documentés, coding terminé, revue signée, gel convenu avec le statisticien. Vigie aide à voir ce qui reste. Il ne certifie pas que la base est analysable.",
      },
      {
        type: "note",
        titre: "Limite utile",
        texte:
          "Si le promoteur impose son EDC et son module de queries, Vigie sert de suivi interne (qui relance, qui bloque, quelle charge). Il ne duplique pas la base clinique.",
      },
    ],
  },
  {
    slug: "tec",
    categorie: "metiers",
    titre: "Le technicien d'étude clinique (TEC) dans Vigie",
    description:
      "Screening, inclusions, saisie, requêtes à traiter au centre, temps passé et documents du centre : le TEC dans un outil de gestion de projet clinique.",
    surtitre: "Métiers",
    resume:
      "Le TEC voit les sujets de son centre, les visites protocolaires à venir, les queries à répondre et le temps à valoriser — pas le portefeuille entier de l'établissement.",
    corps: [
      {
        type: "p",
        texte:
          "Le TEC est au centre, auprès de l'investigateur. Son quotidien, ce sont les personnes à présélectionner, les visites à organiser, la saisie dans l'eCRF, les queries à clarifier avec le dossier source, parfois la facturation des actes. Vigie ne remplace ni le dossier patient, ni l'eCRF. Il lui donne une liste de travail claire : quels Subject ID sont actifs, quelles visites approchent, quelles queries lui sont adressées.",
      },
      {
        type: "p",
        texte:
          "Dans beaucoup d'unités, le TEC partage un tableur d'inclusions avec l'ARC et le chef de projet. Ce tableur vieillit mal : colonnes qui divergent, version « du vendredi », copie dans une boîte mail. Un Subject ID dans Vigie, rattaché à un centre et à une étude, évite cette dérive sans collecter le nom du participant.",
      },
      { type: "h2", texte: "Ce qui apparaît sur son écran" },
      {
        type: "ul",
        items: [
          "Sujets du centre : identifiant, statut (prévu, inclus, en cours, sorti), visites.",
          "Queries à répondre, avec le contexte (visite, variable, texte de la demande).",
          "Documents utiles au centre : protocole en vigueur, notes d'information, délégations.",
          "Saisie du temps, pour la refacturation au promoteur ou le suivi d'activité interne.",
        ],
      },
      {
        type: "p",
        texte:
          "Les droits d'un TEC se calquent souvent sur ceux d'un investigateur élargi ou d'un ARC de centre, selon l'organisation locale. L'important est que le rôle soit explicite : on n'accorde pas l'administration de l'instance à la personne qui saisit les visites.",
      },
      {
        type: "note",
        titre: "Données",
        texte:
          "Le TEC manipule des données de santé dans le dossier patient et l'eCRF. Dans Vigie, il ne doit y reporter ni nom, ni date de naissance, ni résultat d'examen. Un numéro d'inclusion suffit au pilotage.",
      },
    ],
  },
  {
    slug: "investigateur",
    categorie: "metiers",
    titre: "L'investigateur dans Vigie",
    description:
      "Ce que voit un investigateur coordonnateur ou principal : sujets de son centre, queries à répondre, documents essentiels, sans noyer le clinicien sous le portefeuille.",
    surtitre: "Métiers",
    resume:
      "Peu d'écrans, l'essentiel : patients de l'étude identifiés par Subject ID, queries en attente, documents à connaître, visites du centre.",
    corps: [
      {
        type: "p",
        texte:
          "L'investigateur n'ouvrira pas un outil tous les matins s'il y trouve le même bruit que le chef de projet. Vigie lui montre ce qui le concerne : les sujets de son centre, les queries qui attendent une réponse médicale, les documents essentiels (protocole, brochure investigateur, note d'information en vigueur), les visites de monitoring planifiées chez lui.",
      },
      {
        type: "p",
        texte:
          "L'investigateur coordonnateur d'une étude promotion interne a un rôle plus large : il est souvent le responsable scientifique, parfois le correspondant des autorités. Il peut alors partager la vue chef de projet. Ce n'est pas le cas par défaut d'un investigateur de centre satellite.",
      },
      { type: "h2", texte: "Répondre à une query" },
      {
        type: "p",
        texte:
          "Une query « à répondre » arrive avec un contexte : Subject ID, visite, variable, question du data manager. L'investigateur (ou le TEC délégué) rédige la réponse. Le data manager la relit, la résout ou la rouvre. Rien ne s'efface. C'est le minimum pour que l'historique tienne la route lors d'un audit interne.",
      },
      {
        type: "ul",
        items: [
          "Pas d'accès à l'administration de l'instance.",
          "Pas de vue sur les centres des autres investigateurs, sauf partage explicite.",
          "Pas de modification des rôles de l'équipe.",
        ],
      },
      {
        type: "note",
        titre: "Délégation",
        texte:
          "La délégation de tâches (log des délégations) reste un document du TMF. Vigie peut en stocker la pièce. Il ne remplace pas la signature de délégation dans le centre.",
      },
    ],
  },
  {
    slug: "promoteur",
    categorie: "metiers",
    titre: "Le promoteur et le suivi interne d'une étude",
    description:
      "Quand l'établissement est promoteur, Vigie sert le suivi opérationnel interne. Il ne remplace pas CTIS, un eCRF promoteur, ni un système de pharmacovigilance.",
    surtitre: "Métiers",
    resume:
      "Promotion interne : même fil (centres, queries, TMF, jalons), avec la responsabilité supplémentaire de ne pas confondre outil de projet et dossier réglementaire.",
    corps: [
      {
        type: "p",
        texte:
          "Beaucoup d'équipes hospitalières sont à la fois centre investigateur et promoteur d'études académiques. Dans ce second cas, le besoin de suivi interne explose : centres partenaires, conventions, TMF, data management, monitoring, déclarations. Vigie couvre la conduite de projet. Les dépôts réglementaires (CTIS, ANSM, CPP) restent dans leurs guichets officiels.",
      },
      {
        type: "p",
        texte:
          "Un rôle « promoteur » en lecture ou en coordination peut être donné à une personne de la direction de la recherche, du service juridique ou de la pharmacie, selon l'organisation. Il voit le portefeuille et les documents, pas forcément les queries ligne à ligne.",
      },
      { type: "h2", texte: "Ce qui reste hors de l'outil" },
      {
        type: "ul",
        items: [
          "Le dépôt et le suivi dans CTIS, ou le dossier CPP / ANSM pour les recherches hors 536/2014.",
          "L'eCRF choisi pour l'étude, s'il est distinct.",
          "La base de pharmacovigilance et les déclarations SUSAR.",
          "La randomisation et la gestion des traitements.",
        ],
      },
      {
        type: "p",
        texte:
          "Cette liste n'est pas un aveu de faiblesse : c'est une frontière saine. Un logiciel qui promet de tout faire finit par mal faire le suivi de projet, qui est déjà un métier complet.",
      },
      {
        type: "note",
        titre: "Responsabilité",
        texte:
          "Le promoteur reste responsable de la qualité de l'essai. Un tableau de bord à jour n'est pas une preuve de conformité. Il est un moyen de voir le travail.",
      },
    ],
  },

  // ------------------------------------------------------------------ guides
  {
    slug: "demarrer-etude",
    categorie: "guides",
    titre: "Démarrer une étude dans Vigie",
    description:
      "Créer une étude, renseigner le cadre réglementaire, inviter l'équipe, ajouter les centres : le premier après-midi de configuration, sans bloquer sur une page vide.",
    surtitre: "Guides",
    resume:
      "Une étude nouvellement créée n'est pas une page blanche cassée. Elle affiche ce qu'il reste à configurer, dans l'ordre utile.",
    corps: [
      {
        type: "p",
        texte:
          "Créer une étude demande un acronyme, un intitulé, un promoteur, un investigateur coordonnateur, et le cadre réglementaire (par exemple RIPH 2, ou essai médicament 536/2014). Les identifiants (ID-RCB, numéro CTIS, référence CPP) peuvent venir ensuite : on ne bloque pas la création sur un numéro qui n'existe pas encore.",
      },
      {
        type: "p",
        texte:
          "Une fois l'étude créée, l'écran d'accueil de l'étude liste les absences : pas de centre, pas de calendrier de visites, pas d'équipe invitée, pas de document. Chaque ligne pointe vers l'action. C'est volontaire. Une liste vide sans explication donne l'impression que l'application est cassée — surtout derrière un filtre d'entreprise qui n'aime pas les pages pauvres.",
      },
      { type: "h2", texte: "Ordre recommandé" },
      {
        type: "ul",
        items: [
          "Cadre réglementaire et checklists associées.",
          "Invitation de l'ARC et du data manager.",
          "Centres : au moins le centre coordonnateur.",
          "Modèle de visites protocolaires (V0, V1, V2…), même provisoire.",
          "Dépôt des documents essentiels déjà disponibles (protocole, note d'information).",
          "Jalons : soumission, premier patient, fin d'inclusions, lock.",
        ],
      },
      {
        type: "p",
        texte:
          "Vous n'avez pas à tout remplir le premier jour. Un TEC peut entrer plus tard. Les sujets n'apparaissent qu'à l'ouverture réelle du centre. L'outil est conçu pour un projet qui se construit, pas pour un dossier déjà clos.",
      },
      {
        type: "note",
        titre: "Démonstration",
        texte:
          "Si vous testez l'instance, chargez le jeu [DÉMO] depuis Administration. Il crée des études fictives déjà peuplées, préfixées, réinitialisables sans toucher aux études réelles.",
      },
    ],
  },
  {
    slug: "ouvrir-centre",
    categorie: "guides",
    titre: "Ouvrir un centre investigateur",
    description:
      "Sélection, initiation, documents du centre, objectif d'inclusions et première visite de mise en place : comment un centre passe de « prévu » à « recrutant ».",
    surtitre: "Guides",
    resume:
      "Un centre n'est pas une ligne dans un tableur : c'est un statut, un investigateur, des documents, un objectif et un calendrier de visites ARC.",
    corps: [
      {
        type: "p",
        texte:
          "Ajouter un centre, c'est enregistrer l'établissement, l'investigateur principal, un contact, un objectif d'inclusions si vous en avez un, et un statut. Les statuts utiles sont peu nombreux : identifié, sélectionné, initié, recrutant, suspendu, clos. Trop de statuts et plus personne ne les tient à jour.",
      },
      {
        type: "p",
        texte:
          "L'ouverture réelle (initiation) s'appuie sur des documents : convention signée, délégations, formations GCP, matériel, accès eCRF. Vigie permet de classer ces pièces dans le TMF du centre et de noter une date d'expiration (formation, assurance, autorisation locale). Un document périmé doit apparaître avant la prochaine visite, pas pendant.",
      },
      { type: "h2", texte: "Visite de mise en place" },
      {
        type: "p",
        texte:
          "La visite de mise en place est une visite de monitoring, pas une visite sujet. Elle a une date prévue, une date réalisée, un compte rendu, des actions. Tant qu'elle n'est pas faite, le centre ne devrait pas passer à « recrutant » — sauf décision explicite, documentée, du chef de projet.",
      },
      {
        type: "ul",
        items: [
          "Vérifier la présence du protocole et des notes d'information en vigueur.",
          "Vérifier les délégations et les accès aux systèmes.",
          "Fixer l'objectif et le rythme de monitoring.",
          "Lister les actions avant le premier patient.",
        ],
      },
      {
        type: "note",
        titre: "Multi-centrique",
        texte:
          "En promotion interne multi-centrique, chaque centre partenaire est un objet distinct. Les queries et les sujets restent filtrables par centre. Le coordonnateur voit l'ensemble ; l'investigateur local, le sien.",
      },
    ],
  },
  {
    slug: "inclure-sujet",
    categorie: "guides",
    titre: "Suivre un sujet sans collecter son identité",
    description:
      "Subject ID, statut, visites protocolaires : comment piloter le recrutement et le suivi des participants sans mettre de nom ni de date de naissance dans l'outil.",
    surtitre: "Guides",
    resume:
      "Vigie identifie un participant par un Subject ID rattaché à un centre. Le dossier médical et l'eCRF restent les lieux des données de santé.",
    corps: [
      {
        type: "p",
        texte:
          "Un sujet dans Vigie, c'est un identifiant (par exemple SUBJ-00125), un centre, un statut (prévu, screening, inclus, en cours, sorti, terminé), et des visites protocolaires. Ce n'est pas une personne nominative. Cette règle n'est pas cosmétique : elle détermine si l'outil reste un logiciel de projet ou devient un traitement de données de santé identifiante.",
      },
      {
        type: "p",
        texte:
          "Le numéro d'inclusion du protocole peut coïncider avec le Subject ID. S'il existe une table de correspondance dans le centre (classeur, logiciel local), le numéro est une donnée pseudonymisée. Le responsable de traitement de l'étude décide si ce mode est acceptable dans l'instance. Par défaut, des compteurs d'inclusions suffisent au pilotage.",
      },
      { type: "h2", texte: "Visites protocolaires" },
      {
        type: "p",
        texte:
          "Le modèle de visites (sélection, randomisation, suivi, fin d'étude) se définit au niveau de l'étude, puis s'applique aux sujets. Une visite a une fenêtre, un statut, éventuellement des queries rattachées. Ce calendrier n'est pas le calendrier des visites ARC.",
      },
      {
        type: "ul",
        items: [
          "Ne jamais saisir un nom, un prénom, une date de naissance, un NIR, une adresse.",
          "Ne jamais coller un compte rendu médical dans une query : résumer le problème de donnée.",
          "Utiliser le Subject ID tel que défini par le protocole ou par l'eCRF.",
        ],
      },
      {
        type: "note",
        titre: "Sortie d'étude",
        texte:
          "Un sujet sorti reste dans l'outil : on ne l'efface pas pour « faire propre ». Son statut change. Les queries ouvertes doivent être closes ou documentées comme sans objet.",
      },
    ],
  },
  {
    slug: "queries",
    categorie: "guides",
    titre: "Ouvrir, répondre et fermer une query",
    description:
      "Cycle de vie d'une query dans Vigie : Open, Answered, Reopened, Resolved, Closed. Historique, indicateurs, et ce qu'il ne faut pas faire.",
    surtitre: "Guides",
    resume:
      "Une query n'est pas un commentaire jetable. Elle a un état, un responsable, un historique, et elle compte dans les indicateurs tant qu'elle n'est pas close.",
    corps: [
      {
        type: "p",
        texte:
          "Une query naît d'un doute sur une donnée : valeur manquante, hors fenêtre, incohérente, non codée. Dans Vigie, on l'ouvre depuis le contexte (sujet, visite, variable) ou depuis le module Queries. Le texte décrit le problème, pas la solution supposée. On indique une gravité. On l'assigne, en pratique, au centre.",
      },
      {
        type: "p",
        texte:
          "Le destinataire répond. Le data manager relit. S'il accepte, il passe en résolu puis en fermé. S'il refuse, il rouvre, avec un commentaire. Chaque étape est datée et signée par le compte. On ne réécrit pas l'historique.",
      },
      { type: "h2", texte: "Les cinq états" },
      {
        type: "ul",
        items: [
          "Ouverte — le centre n'a pas encore répondu.",
          "Répondue — une réponse existe, pas encore acceptée.",
          "Rouverte — la réponse ne convient pas ; le cycle recommence.",
          "Résolue — le data manager accepte ; il reste parfois une vérification formelle.",
          "Fermée — plus rien à faire ; sort des files actives.",
        ],
      },
      {
        type: "p",
        texte:
          "Les indicateurs du data manager (ouvertes, âgées de plus de N jours, par centre) ne comptent que les états actifs. Fermer une query pour améliorer un tableau de bord est une mauvaise pratique. La rouverture existe précisément pour ne pas tricher avec le « résolu » trop tôt.",
      },
      {
        type: "note",
        titre: "EDC du promoteur",
        texte:
          "Si les queries officielles vivent dans l'eCRF, vous pouvez quand même suivre dans Vigie les relances internes, les sujets bloquants, la charge. Évitez la double vérité : une query « fermée ici, ouverte là » sans commentaire.",
      },
    ],
  },
  {
    slug: "visites-monitoring",
    categorie: "guides",
    titre: "Planifier et documenter une visite de monitoring",
    description:
      "Mise en place, routine, clôture, visite à distance : préparation, réalisation, lettre de suivi et actions, distinctes des visites protocolaires.",
    surtitre: "Guides",
    resume:
      "Une visite ARC a une date prévue, une date réalisée, un type, un centre et des actions. Sans lettre de suivi, elle n'est pas terminée.",
    corps: [
      {
        type: "p",
        texte:
          "Le calendrier de monitoring se construit à partir du risque et du rythme prévu au protocole de monitoring. Un centre qui recrute vite et accumule des queries n'a pas le même rythme qu'un centre en veille. Vigie permet de planifier, de glisser une date, d'enregistrer la réalisation et de lier un document (lettre, rapport).",
      },
      {
        type: "p",
        texte:
          "La préparation d'une visite, c'est : queries ouvertes du centre, écarts non clos, documents expirants, inclusions depuis la dernière visite, actions encore ouvertes. Si ces listes sont à jour, l'ARC n'arrive pas les mains vides. Si elles ne le sont pas, la visite devient une chasse au renseignement.",
      },
      { type: "h2", texte: "Après la visite" },
      {
        type: "ul",
        items: [
          "Marquer la visite réalisée, avec la date réelle.",
          "Déposer le compte rendu ou la lettre de suivi dans le TMF.",
          "Ouvrir les écarts constatés, avec une gravité.",
          "Créer les actions, avec un responsable et une échéance.",
        ],
      },
      {
        type: "p",
        texte:
          "Une action « faite » n'est close qu'après vérification. C'est le B-A-BA du CAPA, souvent oublié quand l'action vit dans un fil de mails. L'écran d'actions de Vigie distingue créée, en cours, faite, vérifiée, close.",
      },
      {
        type: "note",
        titre: "Visite à distance",
        texte:
          "Une visite à distance est un type, pas une absence de traces. Elle a les mêmes exigences de préparation, de compte rendu et d'actions. Le mot « distant » ne réduit pas le besoin de documentation.",
      },
    ],
  },
  {
    slug: "tmf-documents",
    categorie: "guides",
    titre: "Classer les documents d'un Trial Master File",
    description:
      "Dépôt, version, date, catégorie TMF, expiration : comment Vigie range les pièces essentielles sans se prendre pour une GED hospitalière complète.",
    surtitre: "Guides",
    resume:
      "Chaque document a une étude, une catégorie, une version et une date. Un TMF n'est pas un dossier « divers » sur un disque partagé.",
    corps: [
      {
        type: "p",
        texte:
          "Le Trial Master File rassemble les documents essentiels qui permettent de reconstituer la conduite de l'essai. Vigie propose un classement par catégories (protocole, consentement, autorisations, conventions, monitoring, data management, pharmacovigilance, etc.). Ce n'est pas une reproduction exhaustive du TMF Reference Model : c'est un classement opérationnel, suffisant pour retrouver une pièce et voir ce qui manque.",
      },
      {
        type: "p",
        texte:
          "Chaque dépôt conserve le fichier, la version, la date, la personne qui l'a déposé. Un protocole amendé ne remplace pas silencieusement le précédent : on archive la version. Un document avec date d'expiration (assurance, formation, comité) peut remonter dans les alertes.",
      },
      { type: "h2", texte: "Qui dépose quoi" },
      {
        type: "ul",
        items: [
          "Le chef de projet : pièces réglementaires, conventions, protocoles.",
          "L'ARC : lettres de monitoring, documents de centre.",
          "Le data manager : DMP, plans de revue, exports de suivi (sans données cliniques brutes si possible).",
          "L'investigateur : pièces locales, si l'organisation l'a prévu.",
        ],
      },
      {
        type: "p",
        texte:
          "Le téléchargement d'un document vérifie l'accès à l'étude, pas seulement le fait d'être connecté. Un lien de fichier n'est pas public. Les pages publiques du site, elles, ne contiennent aucun document d'étude.",
      },
      {
        type: "note",
        titre: "Archivage légal",
        texte:
          "La durée de conservation des documents d'un essai est fixée par la réglementation et par le promoteur. Vigie ne supprime rien tout seul. L'archivage pérenne (durée, support, lieu) reste une décision d'établissement.",
      },
    ],
  },
  {
    slug: "ecarts-capa",
    categorie: "guides",
    titre: "Enregistrer un écart et suivre une CAPA",
    description:
      "Déviation au protocole, écart majeur ou critique, action corrective et préventive : comment éviter que le suivi tienne dans une boîte mail.",
    surtitre: "Guides",
    resume:
      "Un écart a une gravité, un impact, un statut. Une action n'est close qu'après vérification d'efficacité.",
    corps: [
      {
        type: "p",
        texte:
          "Un écart, c'est le constat qu'on a fait autrement que prévu : visite hors fenêtre, consentement mal daté, procédure non suivie, donnée non saisie. Tous les écarts ne sont pas majeurs. Tous n'exigent pas une CAPA formelle. Tous doivent pouvoir être retrouvés, avec ce qui a été décidé.",
      },
      {
        type: "p",
        texte:
          "Dans Vigie, l'écart est rattaché à une étude, souvent à un centre, parfois à un sujet (Subject ID) ou à une visite. On saisit la gravité, la date de constat, la description, le statut. On peut y lier une ou plusieurs actions : corrective (réparer), préventive (éviter que ça se reproduise).",
      },
      { type: "h2", texte: "Ce qui fait échouer un CAPA" },
      {
        type: "ul",
        items: [
          "L'action « sensibiliser l'équipe » sans responsable ni date.",
          "Le constat recopié, jamais relancé.",
          "La clôture le jour même, sans vérifier que le problème a cessé.",
          "Le mélange entre écart mineur documenté et signalement réglementaire.",
        ],
      },
      {
        type: "p",
        texte:
          "Vigie n'envoie pas l'écart à l'autorité compétente. Si un écart exige une déclaration, le circuit officiel s'applique, en dehors de cet outil. Ici, on suit le travail : qui fait quoi, pour quand, est-ce vérifié.",
      },
      {
        type: "note",
        titre: "Audit",
        texte:
          "Lors d'un audit interne, la question n'est pas « avez-vous un logiciel ? ». C'est « pouvez-vous montrer la liste des écarts ouverts, et ce qui a été fait ? ». L'historique des actions répond à ça, s'il a été tenu.",
      },
    ],
  },
  {
    slug: "roles-et-droits",
    categorie: "guides",
    titre: "Rôles, invitations et droits d'accès",
    description:
      "Comptes individuels, invitations nominatives, rôles serveur (chef de projet, DM, ARC, investigateur, lecture seule) et super-administrateur.",
    surtitre: "Guides",
    resume:
      "Les permissions sont vérifiées sur le serveur. Un rôle n'est pas un habillage d'interface. Une étude n'est visible que si on y a été convié.",
    corps: [
      {
        type: "p",
        texte:
          "Le premier compte de l'instance se crée à l'installation, avec la clé du serveur. Il est super-administrateur. Les comptes suivants arrivent par invitation nominative : un lien, valable quelques jours, à usage unique. Il n'y a pas d'inscription ouverte au public, et pas d'envoi d'e-mail automatique : le lien se remet de la main à la main, ce qui évite d'avoir à configurer un relais de messagerie.",
      },
      {
        type: "p",
        texte:
          "Chaque compte a un rôle global (métier) et, sur chaque étude, un accès (lecture ou écriture) s'il a été invité. Le super-administrateur gère l'instance (comptes, démonstration, paramètres). Il n'a pas vocation à tout voir « parce que c'est plus simple » : le cloisonnement des études reste la règle.",
      },
      { type: "h2", texte: "Rôles utiles" },
      {
        type: "ul",
        items: [
          "Chef de projet — portefeuille, jalons, configuration de l'étude.",
          "Data manager — queries, revue, CRF, jalons de données.",
          "ARC — centres, visites de monitoring, écarts.",
          "Investigateur / TEC — sujets du centre, réponses aux queries.",
          "Lecture seule — reporting, sans modification.",
        ],
      },
      {
        type: "p",
        texte:
          "Un compte désactivé perd l'accès tout de suite. Le mot de passe est haché (scrypt, sel unique). La session vit dans un cookie HttpOnly. Il n'y a pas de compte « équipe » partagé : si trois personnes se connectent avec le même identifiant, l'audit ne veut plus rien dire.",
      },
      {
        type: "note",
        titre: "Recherche",
        texte:
          "Ctrl+K cherche dans ce à quoi vous avez droit : étude, Subject ID, query. Un identifiant qui n'appartient pas à vos études ne remonte pas.",
      },
    ],
  },

  // -------------------------------------------------------------- cas d'usage
  {
    slug: "oncologie",
    categorie: "cas-usage",
    titre: "Suivre une étude d'oncologie",
    description:
      "Inclusions lentes, nombreux centres, visites denses, queries fréquentes : comment un essai d'oncologie se pilote dans un outil de clinical operations hospitalier.",
    surtitre: "Cas d'usage",
    resume:
      "L'oncologie concentre les difficultés de suivi : beaucoup de visites, beaucoup de centres, beaucoup de queries. Le besoin n'est pas un eCRF de plus, c'est une vue opérationnelle.",
    corps: [
      {
        type: "p",
        texte:
          "Une étude d'oncologie hospitalière, industrielle ou académique, a souvent un calendrier de visites dense, des traitements concomitants, des critères de toxicité, et un recrutement plus lent qu'on ne l'avait promis. Le chef de projet passe son temps à croiser trois fichiers : inclusions, monitoring, queries. Vigie les relie par construction.",
      },
      {
        type: "p",
        texte:
          "Les sujets y sont des Subject ID. Les toxicités et les SAE se suivent comme objets de projet (signalement fait / non fait, documents déposés), pas comme base de pharmacovigilance. La déclaration réglementaire reste dans le système prévu à cet effet.",
      },
      { type: "h2", texte: "Points de vigilance" },
      {
        type: "ul",
        items: [
          "Fenêtres de visites étroites : le calendrier protocolaire doit être visible par le TEC.",
          "Amendements fréquents : versionner le protocole dans le TMF, et dater le passage en vigueur au centre.",
          "Centres à faible recrutement : le statut et le rythme de monitoring doivent pouvoir baisser sans perdre l'historique.",
          "Queries de cohérence nombreuses : le data manager filtre par centre et par âge de query.",
        ],
      },
      {
        type: "p",
        texte:
          "Le jeu de démonstration AURORA, fourni avec l'instance, illustre une étude d'oncologie fictive. Les noms de patients n'existent pas. Les centres et les queries sont inventés. Il sert à former l'équipe, pas à communiquer un résultat médical.",
      },
      {
        type: "note",
        titre: "Ce n'est pas un dossier de cancérologie",
        texte:
          "Aucun compte rendu anatomopathologique, aucune imagerie, aucun compte rendu de RCP n'a vocation à être collé dans Vigie. Le TMF accueille des documents de conduite d'essai, pas le dossier de soin.",
      },
    ],
  },
  {
    slug: "etude-academique",
    categorie: "cas-usage",
    titre: "Une recherche académique à promotion interne",
    description:
      "Quand l'hôpital est promoteur : TMF à construire, centres partenaires, data management interne, checklists RIPH ou 536/2014, budget et conventions.",
    surtitre: "Cas d'usage",
    resume:
      "La promotion interne ajoute le TMF, le monitoring, le data management et les conventions. C'est le cas où un tableur unique craque le plus vite.",
    corps: [
      {
        type: "p",
        texte:
          "En promotion interne, l'établissement n'est plus seulement un centre. Il doit produire un TMF, un plan de monitoring, un plan de data management, des conventions avec les centres partenaires, un suivi des autorisations. Les équipes sont souvent petites. L'outil doit donc réduire les allers-retours, pas ajouter une usine.",
      },
      {
        type: "p",
        texte:
          "Le cadre peut être une RIPH 1, 2 ou 3, un essai médicament sous le règlement 536/2014, ou une investigation de dispositif. La checklist Vigie correspondante s'affiche une fois le cadre choisi. Elle n'est pas un avis juridique. Elle évite d'oublier une étape classique (assurance, registre des traitements, information des personnes, archivage).",
      },
      { type: "h2", texte: "Objets qui manquent dans un tableur" },
      {
        type: "ul",
        items: [
          "L'historique des queries, dès que deux personnes s'en occupent.",
          "Les dates d'expiration des documents de centre.",
          "Le lien entre un écart et ses actions.",
          "Le temps passé, pour justifier un financement ou une délégation de personnel.",
        ],
      },
      {
        type: "p",
        texte:
          "CANNA-BICH, dans le jeu de démonstration, est une étude académique fictive. Elle montre un TMF commencé, des centres, des queries, des visites. Elle ne décrit aucune recherche réelle sur un produit de santé.",
      },
      {
        type: "note",
        titre: "Juridique",
        texte:
          "Le service juridique et la direction de la recherche restent décisionnaires sur les conventions et les dépôts. Vigie stocke l'état d'avancement et les pièces, il ne signe pas à leur place.",
      },
    ],
  },
  {
    slug: "dispositif-medical",
    categorie: "cas-usage",
    titre: "Investigation clinique sur dispositif médical (MDR)",
    description:
      "Règlement (UE) 2017/745, investigation clinique, documents techniques et suivi opérationnel : ce que Vigie couvre, et ce qu'il laisse au dossier réglementaire.",
    surtitre: "Cas d'usage",
    resume:
      "Le MDR change les interlocuteurs et les documents. Le besoin opérationnel reste le même : centres, visites, TMF, écarts, jalons.",
    corps: [
      {
        type: "p",
        texte:
          "Une investigation clinique de dispositif médical n'est pas un essai médicament. Le règlement (UE) 2017/745 impose son propre circuit, ses documents, parfois un organisme notifié. Vigie propose une checklist MDR, datée, sourcée. Elle aide à ne pas oublier. Elle ne remplace pas le dossier technique ni l'avis d'un réglementaire dispositifs.",
      },
      {
        type: "p",
        texte:
          "Sur le terrain, le suivi ressemble pourtant à celui d'un essai : des centres, un investigateur, des participants identifiés par un code, des visites, des écarts, un TMF. C'est cette couche que l'outil traite. Les exigences de traçabilité du dispositif (numéro de série, UDI) restent dans les systèmes prévus à cet effet, sauf si l'équipe choisit de déposer une pièce au TMF.",
      },
      { type: "h2", texte: "Checklist et projet" },
      {
        type: "ul",
        items: [
          "Cocher le référentiel MDR sur l'étude, pas un référentiel médicament par habitude.",
          "Versionner le plan d'investigation clinique comme on versionne un protocole.",
          "Suivre les centres et les formations spécifiques au dispositif.",
          "Documenter les écarts, y compris matériels, sans en faire une materiovigilance parallèle.",
        ],
      },
      {
        type: "note",
        titre: "IVDR",
        texte:
          "Les études de performances de diagnostic in vitro relèvent du règlement 2017/746. Vigie a un référentiel distinct. Ne pas fusionner MDR et IVDR dans la même checklist « parce que c'est un dispositif ».",
      },
    ],
  },
  {
    slug: "diagnostic-in-vitro",
    categorie: "cas-usage",
    titre: "Étude de performances en diagnostic in vitro (IVDR)",
    description:
      "Règlement (UE) 2017/746, échantillons, performances analytiques et cliniques : piloter le projet sans transformer Vigie en LIMS ou en dossier technique IVD.",
    surtitre: "Cas d'usage",
    resume:
      "L'IVDR a ses documents et ses définitions. Le suivi de projet — centres, jalons, TMF, queries de données de performance — peut vivre dans Vigie.",
    corps: [
      {
        type: "p",
        texte:
          "Une étude de performances n'inclut pas toujours des « patients » au sens d'un essai interventionnel, mais elle a des sites, des protocoles, des données à relire, des documents essentiels. Les équipes de biologie et de recherche clinique ne parlent pas toujours le même vocabulaire. L'outil force un minimum commun : une étude, des centres, des jalons, un TMF.",
      },
      {
        type: "p",
        texte:
          "Vigie ne gère pas le stock d'échantillons, les congélateurs, ni les courbes de calibration. Un LIMS ou un registre d'échantillons reste nécessaire si l'étude en a besoin. En revanche, les queries sur une donnée de performance, les écarts au plan, les visites de suivi de site, les conventions, y ont leur place.",
      },
      { type: "h2", texte: "Pièges fréquents" },
      {
        type: "ul",
        items: [
          "Utiliser une checklist RIPH par analogie, alors que le cadre IVDR s'applique.",
          "Coller des résultats bruts d'analyse dans une page de travail : ce n'est pas un eCRF.",
          "Oublier les dates d'expiration des documents du fabricant ou du laboratoire partenaire.",
        ],
      },
      {
        type: "note",
        titre: "Aide au travail",
        texte:
          "Le référentiel IVDR affiché dans Vigie porte une date de vérification et des liens vers les textes. Vérifiez toujours la version en vigueur avant une décision.",
      },
    ],
  },
  {
    slug: "unite-recherche-clinique",
    categorie: "cas-usage",
    titre: "Équiper une unité de recherche clinique hospitalière",
    description:
      "Plusieurs études, plusieurs métiers, un seul serveur interne : ce que change Vigie dans une URC ou un CIC, par rapport à des tableurs et des disques partagés.",
    surtitre: "Cas d'usage",
    resume:
      "Une unité gère un portefeuille, pas une étude isolée. Comptes individuels, cloisonnement, temps, documents : l'unité est le vrai terrain de l'outil.",
    corps: [
      {
        type: "p",
        texte:
          "Une unité de recherche clinique mène simultanément des essais industriels, des protocoles institutionnels, parfois des investigations de dispositifs. Les ARC et TEC passent d'une étude à l'autre. Le chef de projet a besoin d'une charge agrégée. Le data manager, d'une file de queries qui traverse les études. Un fichier par étude, posé sur un disque, ne tient pas cette maille.",
      },
      {
        type: "p",
        texte:
          "Vigie s'installe sur un serveur de l'établissement. Les comptes sont nominatifs. Une personne voit les études auxquelles on l'a conviée. Les indicateurs d'équipe, lorsqu'ils existent, portent sur ce périmètre. Il n'y a pas de tableau magique « tout le CHU » pour qui n'en a pas la charge.",
      },
      { type: "h2", texte: "Déploiement type" },
      {
        type: "ul",
        items: [
          "Installer l'instance, créer le premier compte administrateur.",
          "Inviter le noyau (chef de projet, un ARC, un data manager).",
          "Charger la démonstration, former une heure sur AURORA.",
          "Créer une vraie étude pilote, une seule, et tenir un mois.",
          "Étendre aux autres études, sans migrer l'historique papier d'un coup.",
        ],
      },
      {
        type: "p",
        texte:
          "La formation n'a pas besoin d'être longue si les mots de l'écran sont ceux du métier. C'est le pari de l'interface : étude, centre, query, visite de monitoring, TMF. Pas « workspace », « board » ou « issue ».",
      },
      {
        type: "note",
        titre: "Filtre d'entreprise",
        texte:
          "Les pages que vous lisez font partie du site public, volontairement denses, pour qu'un filtre web d'établissement classe Vigie comme un site professionnel d'information, pas comme une page vide.",
      },
    ],
  },

  // -------------------------------------------------------------- actualités
  {
    slug: "pourquoi-outil-dedie",
    categorie: "actualites",
    titre: "Pourquoi un outil dédié plutôt qu'un tableur partagé",
    description:
      "Un tableur reste utile. Il cesse de l'être quand plusieurs métiers mettent à jour le même suivi d'étude, avec des versions, des droits et un historique.",
    surtitre: "Articles",
    date: "2026-08-12",
    resume:
      "Le tableur n'est pas l'ennemi. L'ennemi, c'est le tableur qui devient le système d'information de l'unité, sans droits, sans historique, sans lien entre les objets.",
    corps: [
      {
        type: "p",
        texte:
          "Un tableur est parfait pour un export, une réunion, un calcul ponctuel. Il devient fragile dès que trois personnes le mettent à jour, que l'on a besoin de savoir qui a changé une date, et que l'on veut relier une query à un centre et à un sujet. On se retrouve avec « suivi_v7_final_vraiment.xlsx » dans trois boîtes mail.",
      },
      {
        type: "p",
        texte:
          "Vigie n'interdit pas l'export. Il propose un export justement. Mais l'objet de travail quotidien — l'étude, le centre, la query — a une identité stable, des droits, un historique. C'est la différence entre un document et un système.",
      },
      { type: "h2", texte: "Ce qu'un tableur ne voit pas" },
      {
        type: "ul",
        items: [
          "Le cloisonnement : tout le monde voit tout, ou personne ne s'y retrouve dans les onglets cachés.",
          "L'invitation d'un investigateur sans lui montrer les autres études.",
          "Le cycle de vie d'une query, avec rouverture.",
          "La date d'expiration d'un document, sans une colonne oubliée.",
        ],
      },
      {
        type: "p",
        texte:
          "Passer d'un tableur à Vigie ne se fait pas en migrant vingt colonnes d'un coup. On choisit une étude, on tient les objets pendant quelques semaines, on compare le temps perdu en « quelle est la bonne version ». Si le gain n'est pas là, l'outil ne sert à rien. S'il est là, on étend.",
      },
      {
        type: "note",
        titre: "Pas un manifeste anti-Excel",
        texte:
          "Les indicateurs de Vigie s'exportent. Les listes aussi. Le tableur redevient un outil d'analyse, plus un outil de vérité concurrente.",
      },
    ],
  },
  {
    slug: "cycle-de-vie-des-queries",
    categorie: "actualites",
    titre: "Le cycle de vie des queries, expliqué sans jargon logiciel",
    description:
      "Ouverte, répondue, rouverte, résolue, fermée : pourquoi cinq états, et pourquoi on historise plutôt que d'écraser le dernier commentaire.",
    surtitre: "Articles",
    date: "2026-08-14",
    resume:
      "Cinq états, ce n'est pas de la bureaucratie. C'est la différence entre une conversation et une preuve de suivi.",
    corps: [
      {
        type: "p",
        texte:
          "Dans beaucoup d'unités, une query est un e-mail. Parfois un commentaire dans l'eCRF. Parfois une cellule rouge. Quand le data manager demande « elle est où, celle du sodium de SUBJ-00125 ? », la réponse prend dix minutes. Un cycle de vie explicite raccourcit cette recherche : l'objet existe, il a un état, on peut le filtrer.",
      },
      {
        type: "p",
        texte:
          "La rouverture choque parfois. On aimerait un monde où toute réponse est bonne du premier coup. En pratique, une valeur corrigée trop vite, une justification incomplète, un document manquant, et il faut reposer la question. Rouvrir n'est pas sanctionner. C'est refuser de faire semblant.",
      },
      { type: "h2", texte: "Indicateurs honnêtes" },
      {
        type: "p",
        texte:
          "Compter les queries ouvertes par centre, c'est utile. Compter celles de plus de quatorze jours, aussi. Compter les fermetures de la semaine, seulement si on ne ferme pas pour faire baisser le chiffre. L'historique existe pour qu'un chef de projet puisse voir les allers-retours, pas seulement le stock.",
      },
      {
        type: "ul",
        items: [
          "N'assignez pas une query à « l'équipe » : un compte, un centre.",
          "N'y collez pas un extrait de dossier patient.",
          "Ne supprimez pas une query « ouverte par erreur » sans trace : fermez-la avec le motif.",
        ],
      },
      {
        type: "note",
        titre: "Lien avec l'eCRF",
        texte:
          "Si l'eCRF est le système maître des queries officielles, alignez les états ou assumez que Vigie n'est qu'un suivi de relance interne. Les deux fonctionnent. Le mélange non dit ne fonctionne pas.",
      },
    ],
  },
  {
    slug: "subject-id-et-rgpd",
    categorie: "actualites",
    titre: "Subject ID, pseudonymisation et ce que Vigie refuse d'être",
    description:
      "Pourquoi Vigie n'enregistre pas le nom des participants, ce qu'implique un numéro d'inclusion, et pourquoi cette page n'est pas une analyse d'impact RGPD.",
    surtitre: "Articles",
    date: "2026-08-16",
    resume:
      "Un identifiant d'étude n'est pas un nom. C'est déjà une donnée. La frontière avec l'identifiant direct, elle, ne se négocie pas dans l'interface.",
    corps: [
      {
        type: "p",
        texte:
          "Vigie est conçu pour le suivi de projet. Les champs prévus pour un participant sont un Subject ID, un centre, un statut, des visites. Pas de nom, pas de date de naissance, pas d'identifiant national. Cette absence n'est pas un oubli de formulaire. C'est une limite de conception.",
      },
      {
        type: "p",
        texte:
          "Un numéro d'inclusion n'est pas anodin. S'il existe une table de correspondance dans le centre, il s'agit de données pseudonymisées. Le responsable de traitement de l'étude (souvent le promoteur) doit inscrire ce traitement, choisir une base légale, informer les personnes, et décider si cet outil fait partie du système d'information de l'essai. Vigie ne prend pas cette décision à votre place.",
      },
      { type: "h2", texte: "Ce que cette architecture change concrètement" },
      {
        type: "ul",
        items: [
          "Un audit interne peut lire des Subject ID sans ouvrir un dossier de soin.",
          "Un filtre d'entreprise ou un administrateur système ne trouve pas de nom de patient dans l'application.",
          "Une fuite de base projet n'est pas une fuite de dossier médical — ce qui ne dispense pas de protéger la base.",
        ],
      },
      {
        type: "p",
        texte:
          "Les comptes utilisateurs, eux, sont des données personnelles (nom, e-mail professionnel, traces de connexion, journal d'audit). Ils vivent sur le serveur de l'établissement. L'éditeur du logiciel n'opère pas de nuage central. La politique de confidentialité de l'instance décrit cela, sans se substituer au registre des traitements de l'établissement.",
      },
      {
        type: "note",
        titre: "Pas une attestation",
        texte:
          "Aucun écran de Vigie n'affirme une conformité RGPD, HIPAA, ou 21 CFR Part 11. Des fonctions (journal, rôles, hébergement local) peuvent entrer dans une démarche de conformité. La démarche, elle, est un travail d'équipe.",
      },
    ],
  },
  {
    slug: "checklists-sans-illusion",
    categorie: "actualites",
    titre: "Des checklists réglementaires, sans se prendre pour un avocat",
    description:
      "RIPH, règlement 536/2014, MDR, IVDR, ICH E6(R3), MR CNIL : à quoi servent les listes de Vigie, et où s'arrête leur crédibilité.",
    surtitre: "Articles",
    date: "2026-08-18",
    resume:
      "Une ligne cochée n'est pas une autorisation. Une référence sourcée, datée, évite d'oublier. Ce n'est déjà pas rien.",
    corps: [
      {
        type: "p",
        texte:
          "Les équipes de recherche clinique n'ont pas un juriste à demeure sur chaque protocole. Elles ont des listes mentales, des diaporamas, des souvenirs de formation. Vigie écrit ces listes, les rattache à un cadre, les date, et pointe vers Légifrance, EUR-Lex, la CNIL, l'ICH. Le bénéfice, c'est la mémoire collective. Le risque, c'est de croire que cocher suffit.",
      },
      {
        type: "p",
        texte:
          "Chaque référentiel affiche une date de vérification. Les textes changent. Un amendement au règlement, une nouvelle méthodologie de référence, une FAQ de l'ANSM, et la ligne devient fausse. L'équipe confirme auprès de la source officielle avant une décision. L'outil le rappelle, parfois lourdement. C'est voulu.",
      },
      { type: "h2", texte: "Comment s'en servir" },
      {
        type: "ul",
        items: [
          "Choisir un cadre principal, pas trois « au cas où ».",
          "Marquer « sans objet » plutôt que de laisser une ligne ouverte par paresse.",
          "Annoter : « déposé le…, pièce dans le TMF ».",
          "Ne pas exporter la checklist comme preuve unique dans un dossier d'autorité.",
        ],
      },
      {
        type: "p",
        texte:
          "Les pages publiques /reglementaire détaillent chaque cadre. Elles existent aussi pour qu'un visiteur, ou un filtre automatique, comprenne que ce site parle de recherche clinique et de gestion de projet, pas d'un service vide.",
      },
    ],
  },
  {
    slug: "monitoring-base-sur-le-risque",
    categorie: "actualites",
    titre: "Monitoring basé sur le risque, version opérationnelle",
    description:
      "ICH E6(R3) insiste sur la proportionnalité. En pratique : ajuster le rythme des visites ARC sans perdre la trace des centres en difficulté.",
    surtitre: "Articles",
    date: "2026-08-19",
    resume:
      "Moins de visites partout, plus de visites là où ça décroche. Encore faut-il voir le décrochage.",
    corps: [
      {
        type: "p",
        texte:
          "Le monitoring basé sur le risque n'est pas « on ne va plus sur site ». C'est une allocation de l'effort : qualité des données, sécurité des personnes, criticité des processus. Pour allouer, il faut des signaux. Un centre sans inclusion depuis quatre mois, une query critique ouverte depuis vingt jours, un écart majeur non clos, une visite reportée deux fois : voilà des signaux.",
      },
      {
        type: "p",
        texte:
          "Vigie n'invente pas un score propriétaire de risque réglementaire. Il affiche des faits que l'ARC et le chef de projet qualifient. Un champ « risque » sur le centre peut être tenu à la main, précisément pour rester un jugement d'équipe, pas une boîte noire.",
      },
      { type: "h2", texte: "Ce que l'écran doit montrer" },
      {
        type: "ul",
        items: [
          "La dernière visite de monitoring et la prochaine.",
          "Le stock de queries ouvertes du centre.",
          "Les écarts non clos.",
          "Les documents expirés ou bientôt expirés.",
        ],
      },
      {
        type: "p",
        texte:
          "ICH E6(R3) est cité dans les référentiels de l'outil comme cadre de bonnes pratiques, pas comme label apposé sur le logiciel. La proportionnalité se décide dans le plan de monitoring, signé, versionné, déposé au TMF.",
      },
    ],
  },
  {
    slug: "auto-hebergement-a-l-hopital",
    categorie: "actualites",
    titre: "Auto-héberger un outil de recherche clinique à l'hôpital",
    description:
      "Serveur interne, HTTPS, sauvegardes, pas de SaaS éditeur : pourquoi Vigie s'installe chez vous, et ce que cela implique pour l'équipe informatique.",
    surtitre: "Articles",
    date: "2026-08-20",
    resume:
      "Pas de nuage éditeur, pas d'abonnement qui bascule. Un répertoire, un certificat, un script de sauvegarde. L'établissement reste maître des données de projet.",
    corps: [
      {
        type: "p",
        texte:
          "Beaucoup d'outils de suivi d'essais sont vendus comme des services en ligne. C'est simple à démontrer. C'est plus délicat dans un établissement de santé, dès que l'on parle de comptes, de documents d'études, parfois de numéros d'inclusion. Vigie fait le choix inverse : l'application tourne sur le serveur de l'établissement. Il n'y a pas de compte chez un éditeur, pas de télémétrie, pas de bascule tarifaire.",
      },
      {
        type: "p",
        texte:
          "Techniquement, c'est un service web, une base SQLite, des fichiers déposés, un reverse proxy qui termine TLS. La sauvegarde copie un répertoire, de façon cohérente. Les mises à jour sont déclenchées, pas subies. Les briques sont sous licences libres irrévocables (MIT, Apache 2.0, MPL 2.0).",
      },
      { type: "h2", texte: "Ce que l'informatique doit prévoir" },
      {
        type: "ul",
        items: [
          "Un nom d'hôte interne ou publié, et un certificat.",
          "Un créneau de sauvegarde, testé par une restauration.",
          "Une politique de comptes : qui invite, qui désactive.",
          "Un filtrage web : le site public doit être assez fourni pour ne pas être classé comme page vide — c'est aussi pour cela que ces articles existent.",
        ],
      },
      {
        type: "p",
        texte:
          "L'auto-hébergement n'absout pas l'établissement. Il déplace la responsabilité au bon endroit : chez le responsable de traitement, avec ses infogérants, ses sauvegardes, ses accès. Un SaaS ne fait que déplacer une partie de l'exploitation, rarement la responsabilité juridique de l'essai.",
      },
    ],
  },

  // -------------------------------------------------------------- ressources
  {
    slug: "checklist-ouverture-centre",
    categorie: "ressources",
    titre: "Liste de contrôle : ouverture d'un centre",
    description:
      "Une liste opérationnelle, non réglementaire, pour préparer l'initiation d'un centre investigateur : documents, accès, formations, première visite.",
    surtitre: "Ressources",
    resume:
      "À adapter au protocole et au promoteur. Utile comme aide-mémoire d'équipe, pas comme pièce à joindre telle quelle à une autorité.",
    corps: [
      {
        type: "p",
        texte:
          "Cette liste est un aide-mémoire d'unité de recherche clinique. Elle ne reprend pas exhaustivement ICH, le règlement 536/2014 ou le MDR. Elle existe pour qu'une initiation ne tienne pas dans un brouillon de mail. Adaptez-la, datez-la, rangez la version que vous retenez dans le TMF de l'étude.",
      },
      { type: "h2", texte: "Avant la visite d'initiation" },
      {
        type: "ul",
        items: [
          "Convention ou contrat signé, ou calendrier de signature explicite.",
          "Investigateur principal identifié, CV et formations à jour selon le promoteur.",
          "Liste de délégation préparée, même provisoire.",
          "Accès eCRF / IWRS demandés, ou date de demande notée.",
          "Protocole et brochures en vigueur imprimés ou accessibles sur site.",
          "Notes d'information et formulaires de consentement de la version en vigueur.",
          "Matériel et circuits (pharmacie, imagerie, labo) identifiés.",
          "Objectif d'inclusions et faisabilité revus avec le centre.",
        ],
      },
      { type: "h2", texte: "Pendant et après" },
      {
        type: "ul",
        items: [
          "Compte rendu d'initiation rédigé et déposé.",
          "Actions ouvertes avec responsable et échéance.",
          "Statut du centre passé à initié, puis recrutant le moment venu.",
          "Prochaine visite de monitoring planifiée, même lointaine.",
        ],
      },
      {
        type: "note",
        titre: "Dans Vigie",
        texte:
          "Chaque puce peut devenir un document, une mission ou une action. L'intérêt n'est pas de cocher cette page web, c'est de retrouver la trace dans l'étude.",
      },
    ],
  },
  {
    slug: "checklist-cloture-etude",
    categorie: "ressources",
    titre: "Liste de contrôle : clôture d'une étude",
    description:
      "Fin d'inclusions, dernières visites, queries, TMF, archivage, database lock : un ordre de bataille pour ne pas clore trop tôt.",
    surtitre: "Ressources",
    resume:
      "Clôturer, c'est un projet dans le projet. Les queries ouvertes et les documents manquants se voient trop tard si on n'en fait pas une liste.",
    corps: [
      {
        type: "p",
        texte:
          "La clôture commence avant le dernier patient. On arrête les inclusions, on termine les suivis, on vide les queries, on range le TMF, on gèle la base, on archive. Chaque étape a un responsable. Si tout le monde « s'en occupe », personne ne s'en occupe.",
      },
      { type: "h2", texte: "Données et queries" },
      {
        type: "ul",
        items: [
          "Stock de queries ouvertes à zéro, ou liste d'exceptions documentée.",
          "Coding terminé, ou plan de gel partiel expliqué.",
          "Revue de données signée (même un procès-verbal interne).",
          "Jalon de lock posé, avec date et personnes présentes.",
        ],
      },
      { type: "h2", texte: "Centres et documents" },
      {
        type: "ul",
        items: [
          "Visites de clôture planifiées et réalisées, lettres déposées.",
          "Écarts majeurs clos ou explicitement reportés.",
          "TMF : protocoles, consentements, autorisations, conventions, monitoring.",
          "Décision d'archivage : où, combien de temps, qui a la clé.",
        ],
      },
      {
        type: "p",
        texte:
          "Vigie peut porter ces jalons et ces listes. Il ne produit pas à lui seul un certificat de clôture réglementaire. Le promoteur reste responsable de ce qu'il déclare clos.",
      },
    ],
  },
  {
    slug: "modele-compte-rendu-visite",
    categorie: "ressources",
    titre: "Trame de compte rendu de visite de monitoring",
    description:
      "Sections utiles d'une lettre ou d'un rapport de visite ARC : faits, écarts, actions, sans se substituer au modèle imposé par un promoteur industriel.",
    surtitre: "Ressources",
    resume:
      "Une trame interne, courte, pour les études où l'établissement définit lui-même le monitoring. Si le promoteur impose la sienne, utilisez la sienne.",
    corps: [
      {
        type: "p",
        texte:
          "Beaucoup de promoteurs industriels imposent leur modèle de rapport. Dans ce cas, déposez leur PDF dans le TMF et créez les actions dans Vigie. La trame ci-dessous s'adresse aux recherches où l'unité rédige elle-même la lettre de suivi.",
      },
      { type: "h2", texte: "En-tête" },
      {
        type: "ul",
        items: [
          "Étude (acronyme, identifiants).",
          "Centre, investigateur, date de visite, type (mise en place, routine, clôture, distance).",
          "Personnes présentes.",
          "Période couverte depuis la visite précédente.",
        ],
      },
      { type: "h2", texte: "Corps" },
      {
        type: "ul",
        items: [
          "Recrutement : inclus depuis la dernière visite, sorties, difficultés.",
          "Consentement : version, points relevés.",
          "Données et queries : stock, points bloquants (Subject ID uniquement).",
          "Produit / dispositif / circuit pharmacie, si applicable, sans détail de stock inutile.",
          "Écarts constatés, gravité, actions immédiates.",
          "Documents et formations : expirations.",
          "Actions : responsable, échéance, reprise des actions antérieures encore ouvertes.",
        ],
      },
      {
        type: "p",
        texte:
          "Le ton reste factuel. On n'écrit pas un roman. On n'identifie pas un participant par son nom. On termine par la date de la prochaine visite, même indicative.",
      },
      {
        type: "note",
        titre: "Dépôt",
        texte:
          "Dans Vigie, le compte rendu est un document de la catégorie monitoring, lié à la visite. Les actions sont des objets séparés, relançables, pas un paragraphe perdu page 7.",
      },
    ],
  },
  {
    slug: "questions-avant-database-lock",
    categorie: "ressources",
    titre: "Questions à se poser avant un database lock",
    description:
      "Une liste de questions de data management et de conduite d'étude, pour une réunion de gel de base. Ce n'est pas un protocole de lock universel.",
    surtitre: "Ressources",
    resume:
      "Le lock est une décision d'équipe. Ces questions aident à ne rien oublier dans l'ordre du jour. Elles ne remplacent pas le DMP.",
    corps: [
      {
        type: "p",
        texte:
          "La réunion de lock échoue souvent parce que chacun arrive avec sa liste mentale. Voici une liste explicite, à annoter, à contredire, à raccourcir. Elle mélange volontairement data management et opérations : le lock n'est pas qu'une affaire de base.",
      },
      { type: "h2", texte: "Données" },
      {
        type: "ul",
        items: [
          "Combien de queries encore ouvertes, de quelle gravité, sur quels centres ?",
          "Quelles queries sont « acceptées en l'état », et qui l'a décidé ?",
          "Le coding est-il terminé ? Quel dictionnaire, quelle version ?",
          "Les critères d'analyse (populations) sont-ils figés avec le statisticien ?",
          "Y a-t-il des données attendues après le lock (suivis longs) et comment sont-elles gérées ?",
        ],
      },
      { type: "h2", texte: "Opérations" },
      {
        type: "ul",
        items: [
          "Tous les centres clos ont-ils une visite de clôture documentée ?",
          "Les écarts majeurs sont-ils clos ou listés en exception ?",
          "Le TMF contient-il le DMP, les versions de CRF, les décisions de gel ?",
          "Qui a le droit de dégeler, selon quelle procédure ?",
        ],
      },
      {
        type: "p",
        texte:
          "Notez les réponses dans une page de travail de l'étude, ou dans un document daté. Vigie historisera qui a déposé quoi. Il ne « verrouillera » pas magiquement l'eCRF du promoteur.",
      },
    ],
  },
];
