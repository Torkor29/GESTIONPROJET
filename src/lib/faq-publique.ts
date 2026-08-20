/** Questions fréquentes du site public — textes uniques, en français. */

export const FAQ_PUBLIQUE: { question: string; reponse: string }[] = [
  {
    question: "Vigie est-il un cahier d'observation électronique (eCRF) ?",
    reponse:
      "Non. Vigie est un outil de gestion de projet en recherche clinique. La saisie des données cliniques reste dans l'eCRF du promoteur ou de la plateforme institutionnelle. On y décrit la structure du CRF pour rattacher queries et revues, pas pour remplacer la base clinique.",
  },
  {
    question: "Enregistre-t-on le nom des patients ?",
    reponse:
      "Non. Un participant est identifié par un Subject ID, rattaché à un centre et à une étude. Pas de nom, pas de date de naissance, pas d'identifiant national. Le dossier de soin et l'eCRF restent les lieux des données de santé.",
  },
  {
    question: "Faut-il un compte pour lire ce site ?",
    reponse:
      "Les pages de présentation, les guides, les métiers, les référentiels réglementaires, le glossaire et les mentions sont publiques. Les études, documents, queries et tableaux de bord exigent un compte de l'établissement, créé par invitation.",
  },
  {
    question: "Comment obtenir un compte ?",
    reponse:
      "Il n'y a pas d'inscription ouverte. Une personne déjà autorisée vous remet un lien d'invitation, valable quelques jours et à usage unique. Le premier compte de l'instance se crée à l'installation du serveur, avec la clé d'installation.",
  },
  {
    question: "Où sont hébergées les données ?",
    reponse:
      "Sur le serveur de l'établissement qui installe Vigie. Il n'existe pas de nuage éditeur, ni de compte chez un prestataire commercial imposé par le logiciel. Les échanges navigateur–serveur passent par HTTPS.",
  },
  {
    question: "Vigie est-il conforme au RGPD, à ICH-GCP ou à la 21 CFR Part 11 ?",
    reponse:
      "Le logiciel fournit des fonctions (rôles, journal d'audit, hébergement local, absence de données nominatives de participants) qui peuvent s'inscrire dans une démarche de conformité. Il ne délivre aucune attestation. La validation et l'analyse d'impact restent un travail d'équipe, documenté, propre à l'établissement.",
  },
  {
    question: "Quelle est la différence entre une visite de monitoring et une visite protocolaire ?",
    reponse:
      "La visite protocolaire est celle du sujet (V0, V1, V2…). La visite de monitoring est celle de l'ARC au centre (mise en place, routine, clôture, à distance). Ce sont deux listes distinctes. Les confondre fausse le calendrier et les indicateurs.",
  },
  {
    question: "Que signifie le cycle Open / Answered / Reopened / Resolved / Closed ?",
    reponse:
      "C'est le cycle d'une query. Ouverte : en attente de réponse. Répondue : le centre a écrit. Rouverte : la réponse ne convient pas. Résolue : le data manager accepte. Fermée : plus rien à faire. Chaque transition est historisée.",
  },
  {
    question: "Peut-on charger des données de démonstration ?",
    reponse:
      "Oui, depuis Administration, si vous en avez le droit. Le jeu crée des études fictives préfixées [DÉMO], des centres, des sujets identifiés par Subject ID, des queries et des visites. Il se réinitialise sans toucher aux études réelles. Mot de passe des comptes démo : indiqué dans l'administration une fois le jeu chargé.",
  },
  {
    question: "Que se passe-t-il si une étude n'a encore aucun patient ?",
    reponse:
      "Rien de bloquant. Les écrans expliquent la suite : ajouter des centres, un calendrier de visites, l'équipe, des documents. Une liste vide n'est pas une erreur, c'est un projet au début.",
  },
  {
    question: "Les checklists réglementaires valent-elles un avis juridique ?",
    reponse:
      "Non. Ce sont des aides au travail, sourcées et datées. Les textes évoluent. Chaque équipe vérifie la version en vigueur auprès de l'ANSM, du CPP, de la CNIL, de l'EMA ou de l'organisme compétent.",
  },
  {
    question: "Qui voit quelles études ?",
    reponse:
      "Une étude n'est visible que de la personne qui l'a créée et de celles qu'elle y a conviées. Le super-administrateur gère l'instance (comptes, paramètres) ; le cloisonnement des dossiers reste la règle. Ctrl+K ne cherche que dans votre périmètre.",
  },
  {
    question: "Peut-on s'en servir pour la pharmacovigilance ?",
    reponse:
      "Non. On peut suivre, comme objet de projet, qu'un signalement a été fait et déposer une pièce au TMF. La déclaration d'un SAE ou d'un SUSAR, le suivi médical et la base de PV restent dans les systèmes prévus à cet effet.",
  },
  {
    question: "L'outil fonctionne-t-il hors ligne ?",
    reponse:
      "Non. C'est une application web. Elle s'utilise depuis le réseau de l'établissement, ou depuis l'extérieur si l'établissement a publié le service. Un filtre web d'entreprise peut bloquer l'accès si le site est jugé trop pauvre : d'où l'existence de ces pages publiques denses.",
  },
  {
    question: "Quels métiers sont prévus ?",
    reponse:
      "Chef de projet, data manager, ARC, TEC / investigateur, lecture seule, et un super-administrateur d'instance. Les permissions sont appliquées sur le serveur, pas seulement dans les menus.",
  },
  {
    question: "Comment suivre le temps passé ?",
    reponse:
      "Chronomètre ou saisie manuelle, rattaché à une étude et à une activité. L'export sert à la refacturation au promoteur ou au suivi de charge. Ce n'est pas un logiciel de paie.",
  },
  {
    question: "Que contient le TMF dans Vigie ?",
    reponse:
      "Des fichiers versionnés, datés, classés par catégorie (protocole, consentement, autorisations, monitoring, data management…). Ce n'est pas une GED hospitalière complète ni le TMF Reference Model exhaustif. C'est un classement opérationnel pour retrouver une pièce et voir ce qui expire.",
  },
  {
    question: "Y a-t-il des cookies publicitaires ?",
    reponse:
      "Non. Le seul témoin de connexion est le cookie de session, nécessaire après authentification, HttpOnly, retiré à la déconnexion. Pas de mesure d'audience tierce, pas de traceur marketing.",
  },
  {
    question: "Comment signaler un problème d'accessibilité ou de contenu ?",
    reponse:
      "Utilisez la page Contact de cette instance. L'identité de l'éditeur dépend de l'établissement qui héberge l'outil ; elle figure aux mentions légales lorsqu'elle a été renseignée à la configuration.",
  },
  {
    question: "Vigie remplace-t-il CTIS, le CPP ou l'ANSM ?",
    reponse:
      "Non. Les dépôts réglementaires se font dans les guichets officiels. Vigie suit l'avancement interne (jalon « soumis », pièce déposée au TMF) mais n'envoie rien à une autorité.",
  },
  {
    question: "Peut-on utiliser Vigie pour un dispositif médical ou un IVD ?",
    reponse:
      "Oui, comme suivi de projet, avec les checklists MDR ou IVDR. L'outil ne constitue pas le dossier technique, n'est pas un LIMS, et ne remplace pas l'organisme notifié.",
  },
  {
    question: "Que faire si le filtre de mon établissement bloque le site ?",
    reponse:
      "Ces pages publiques (présentation, articles, guides, glossaire, mentions) existent précisément pour fournir un volume de contenu professionnel identifiable. Montrez le plan du site et les mentions légales au service informatique. Si le blocage persiste, une exception d'URL sur le domaine interne reste une décision de l'établissement.",
  },
  {
    question: "Les licences du logiciel peuvent-elles devenir payantes ?",
    reponse:
      "Les briques utilisées (Next.js, React, Drizzle, SQLite, Caddy, BlockNote, etc.) sont sous licences libres irrévocables (MIT, Apache 2.0, MPL 2.0). Une version publiée sous ces licences le reste. L'établissement reste maître de son instance.",
  },
  {
    question: "Comment rechercher une query ou un sujet ?",
    reponse:
      "Une fois connecté, Ctrl+K ouvre la recherche globale : acronyme d'étude, Subject ID, identifiant de query. Seuls les objets de vos études apparaissent.",
  },
  {
    question: "Une action CAPA « faite » est-elle terminée ?",
    reponse:
      "Non. Une action corrective ou préventive se clôt après vérification d'efficacité. L'écran distingue créée, en cours, faite, vérifiée, close. Cocher « fait » le jour du constat ne suffit pas.",
  },
];
