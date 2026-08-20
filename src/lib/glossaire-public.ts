/** Glossaire public étendu — définitions opérationnelles, pas un texte réglementaire. */

export const TERMES_GLOSSAIRE: { mot: string; def: string }[] = [
  {
    mot: "Query",
    def: "Demande de clarification sur une donnée. Cycle usuel dans Vigie : ouverte, répondue, rouverte, résolue, fermée. Chaque transition est historisée (compte, date, commentaire).",
  },
  {
    mot: "CRF / eCRF",
    def: "Cahier d'observation. Vigie décrit la structure (formulaires, variables) pour rattacher queries et revues. La saisie clinique se fait dans l'eCRF du promoteur ou de la plateforme institutionnelle.",
  },
  {
    mot: "Subject ID",
    def: "Identifiant d'un participant dans l'étude, rattaché à un centre. Vigie n'enregistre pas le nom, la date de naissance ni un identifiant national.",
  },
  {
    mot: "Monitoring (visite ARC)",
    def: "Visite de mise en place, de routine, de clôture ou à distance, menée au centre. Distincte des visites protocolaires du sujet.",
  },
  {
    mot: "Visite protocolaire",
    def: "Visite prévue au protocole pour un sujet (sélection, randomisation, suivis, fin d'étude), avec une fenêtre calendaire.",
  },
  {
    mot: "Déviation au protocole",
    def: "Écart entre ce qui était prévu et ce qui a été fait. On en documente la gravité, l'impact, et le cas échéant les actions correctives et préventives.",
  },
  {
    mot: "CAPA",
    def: "Action corrective ou préventive. Une action marquée « faite » n'est close qu'après vérification de son efficacité.",
  },
  {
    mot: "TMF",
    def: "Trial Master File : documents essentiels de l'essai, versionnés, datés, parfois soumis à expiration. Classement opérationnel, pas une GED exhaustive.",
  },
  {
    mot: "ISF",
    def: "Investigator Site File : documents du centre. Souvent un sous-ensemble du TMF, tenu sur site. Vigie peut en stocker des copies de travail si l'équipe l'a décidé.",
  },
  {
    mot: "Database lock",
    def: "Gel de la base avant analyse. Jalon de data management et de conduite d'étude, pas un bouton de conformité magique.",
  },
  {
    mot: "Freeze",
    def: "Gel intermédiaire, parfois partiel, avant un lock. Utile pour une revue ou une analyse intermédiaire. Doit être défini dans le DMP.",
  },
  {
    mot: "SAE / SUSAR",
    def: "Événement indésirable grave / suspicion d'effet inattendu grave. Vigie permet un suivi de projet (signalé, pièce déposée), pas la déclaration réglementaire ni le suivi médical.",
  },
  {
    mot: "DMP",
    def: "Data Management Plan : version, date, responsable, statut de validation. Document de conduite, pas un avis réglementaire.",
  },
  {
    mot: "RIPH",
    def: "Recherche impliquant la personne humaine, au sens du code de la santé publique français (loi Jardé). Trois catégories, des circuits d'autorisation distincts.",
  },
  {
    mot: "Règlement (UE) 536/2014",
    def: "Cadre européen des essais cliniques de médicaments. Dépôts et suivis via CTIS. Distinct des RIPH pour les essais qui y sont soumis.",
  },
  {
    mot: "CTIS",
    def: "Clinical Trials Information System : guichet européen. Vigie n'envoie rien à CTIS ; on y suit un jalon interne et on y dépose une pièce au TMF.",
  },
  {
    mot: "CPP",
    def: "Comité de protection des personnes. Instance d'éthique française. L'avis et le suivi restent dans le circuit officiel.",
  },
  {
    mot: "ANSM",
    def: "Agence nationale de sécurité du médicament et des produits de santé. Autorité compétente pour de nombreuses recherches en France.",
  },
  {
    mot: "MDR",
    def: "Règlement (UE) 2017/745 relatif aux dispositifs médicaux. Une investigation clinique n'est pas un essai médicament : checklist distincte.",
  },
  {
    mot: "IVDR",
    def: "Règlement (UE) 2017/746 relatif aux dispositifs médicaux de diagnostic in vitro. Études de performances : cadre et documents propres.",
  },
  {
    mot: "ICH E6(R3)",
    def: "Bonnes pratiques cliniques, révision 3 : principes et annexe. Vigie s'en inspire pour le vocabulaire opérationnel, sans se déclarer « GCP certified ».",
  },
  {
    mot: "MR-001 / MR-003",
    def: "Méthodologies de référence de la CNIL pour certaines recherches. À confirmer selon la version en vigueur et le responsable de traitement.",
  },
  {
    mot: "Promoteur",
    def: "Personne physique ou morale qui initie un essai et en porte la responsabilité. Peut être l'établissement (promotion interne) ou un industriel.",
  },
  {
    mot: "Investigateur",
    def: "Médecin (ou professionnel habilité) responsable de la conduite de l'essai au centre. Coordonnateur : rôle étendu à l'échelle de l'étude.",
  },
  {
    mot: "ARC",
    def: "Attaché de recherche clinique. Suit les centres, le monitoring, les écarts, souvent les documents de site.",
  },
  {
    mot: "TEC",
    def: "Technicien d'étude clinique. Au centre : screening, visites, saisie eCRF, réponses aux queries, parfois facturation des actes.",
  },
  {
    mot: "Data manager",
    def: "Responsable de la qualité des données : queries, revue, coding, jalons de gel. Pas le statisticien, pas l'ARC.",
  },
  {
    mot: "Coding",
    def: "Codage de termes médicaux (souvent MedDRA, parfois WHODrug). Vigie suit l'avancement, il n'est pas un dictionnaire.",
  },
  {
    mot: "SDV",
    def: "Source Data Verification : comparaison eCRF / source. Activité de monitoring. L'outil note que c'est fait ou à faire, il n'ouvre pas le dossier patient.",
  },
  {
    mot: "Consentement",
    def: "Processus d'information et de recueil. Les notes d'information se versionnent au TMF. Le recueil signé reste dans le centre, pas dans Vigie sous forme nominative.",
  },
  {
    mot: "Randomisation",
    def: "Attribution aléatoire du traitement. Gérée par IWRS / système dédié. Vigie peut noter un jalon ou un accès, pas tirer le sort.",
  },
  {
    mot: "IWRS / IVRS",
    def: "Système de randomisation et d'approvisionnement. Hors périmètre fonctionnel de Vigie.",
  },
  {
    mot: "ID-RCB",
    def: "Identifiant unique d'une recherche en France, attribué via le répertoire. Champ administratif de l'étude, pas une donnée patient.",
  },
  {
    mot: "Centre investigateur",
    def: "Lieu où l'essai est conduit, avec un investigateur principal, un statut (sélectionné, initié, recrutant, suspendu, clos) et souvent un objectif d'inclusions.",
  },
  {
    mot: "Initiation",
    def: "Mise en place du centre : documents, formations, accès, visite de mise en place. Avant le premier participant.",
  },
  {
    mot: "Inclusion",
    def: "Entrée d'un participant dans l'étude, selon les critères du protocole. Dans Vigie : changement de statut d'un Subject ID, ou incrément d'un compteur.",
  },
  {
    mot: "Screening",
    def: "Présélection. Un Subject ID peut exister avant l'inclusion. Les échecs de screening se documentent sans identité.",
  },
  {
    mot: "Audit trail",
    def: "Journal : qui a modifié quoi, quand. Vigie en tient un pour les objets de projet. Ce n'est pas, à lui seul, une validation 21 CFR Part 11.",
  },
  {
    mot: "RBAC",
    def: "Contrôle d'accès basé sur les rôles. Dans Vigie, les permissions sont vérifiées sur le serveur, pas seulement par masquage de boutons.",
  },
  {
    mot: "Empty state",
    def: "État vide pédagogique : une liste sans donnée explique la prochaine action au lieu d'afficher un écran cassé ou muet.",
  },
  {
    mot: "Portefeuille",
    def: "Ensemble des études suivies par une personne ou une unité, avec jalons, risques et charge — vue chef de projet.",
  },
  {
    mot: "Jalon",
    def: "Date clé du projet : soumission, premier patient, fin d'inclusions, lock, CSR. Distinct d'une mission quotidienne.",
  },
  {
    mot: "CSR",
    def: "Clinical Study Report. Livrable d'analyse. Vigie peut porter le jalon et le document final, pas rédiger le rapport.",
  },
  {
    mot: "Convention",
    def: "Contrat entre promoteur et établissement (ou entre promoteur académique et centres). Suivi de signature, montants, échéances : module budget.",
  },
  {
    mot: "Refacturation",
    def: "Valorisation du temps ou des actes auprès du promoteur. Le suivi du temps dans Vigie alimente cet export ; il ne déclenche pas un paiement.",
  },
  {
    mot: "Pseudonymisation",
    def: "Remplacement des identifiants directs par un code, réversible via une table de correspondance détenue par un responsable. Un Subject ID avec table au centre n'est pas une donnée anonyme.",
  },
  {
    mot: "Responsable de traitement",
    def: "Entité qui détermine les finalités et moyens d'un traitement de données. Pour l'essai, souvent le promoteur. Pour les comptes de l'instance, l'établissement hébergeur.",
  },
  {
    mot: "Hébergement local",
    def: "L'application et les fichiers tournent sur un serveur de l'établissement, sans nuage éditeur obligatoire.",
  },
  {
    mot: "Super-administrateur",
    def: "Compte d'instance : invitations, désactivation, chargement de la démonstration, paramètres. N'implique pas de tout voir dans toutes les études par magie.",
  },
];
