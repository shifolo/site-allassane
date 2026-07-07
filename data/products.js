const products = [
  {
    id: "vpn-pro-license-1y",
    type: "logiciel",
    digital: true,
    price: 25000,
    stock: 50,
    image: "assets/img/shop/vpn-pro.jpg",
    fr: {
      name: "Licence VPN Pro — 1 an",
      short: "Accès VPN sécurisé, 1 an, jusqu'à 5 appareils.",
      description: "Une licence d'un an pour un VPN professionnel : chiffrement fort, kill-switch, jusqu'à 5 appareils simultanés. Idéal pour sécuriser vos connexions en télétravail ou en déplacement."
    },
    en: {
      name: "VPN Pro License — 1 year",
      short: "Secure VPN access, 1 year, up to 5 devices.",
      description: "A one-year license for a professional VPN: strong encryption, kill-switch, up to 5 simultaneous devices. Ideal for securing your connections while remote or traveling."
    }
  },
  {
    id: "yubikey-5-nfc",
    type: "hardware",
    digital: false,
    price: 45000,
    stock: 8,
    image: "assets/img/shop/yubikey-5.jpg",
    fr: {
      name: "YubiKey 5 NFC",
      short: "Clé de sécurité physique FIDO2/U2F.",
      description: "Clé de sécurité matérielle compatible FIDO2/U2F, NFC et USB-A. Protège vos comptes contre le phishing et le vol de mot de passe grâce à l'authentification à double facteur physique."
    },
    en: {
      name: "YubiKey 5 NFC",
      short: "Physical FIDO2/U2F security key.",
      description: "Hardware security key compatible with FIDO2/U2F, NFC and USB-A. Protects your accounts against phishing and password theft through physical two-factor authentication."
    }
  },
  {
    id: "audit-securite-pack",
    type: "logiciel",
    digital: true,
    price: 150000,
    stock: 15,
    image: "assets/img/shop/audit-pack.jpg",
    fr: {
      name: "Pack Audit de Sécurité (PME)",
      short: "Outil d'auto-audit + rapport de vulnérabilités.",
      description: "Un pack logiciel pour réaliser un auto-audit de sécurité de votre infrastructure PME, avec génération automatique d'un rapport de vulnérabilités et recommandations priorisées."
    },
    en: {
      name: "Security Audit Pack (SME)",
      short: "Self-audit tool + vulnerability report.",
      description: "A software pack to run a self-audit of your SME's security infrastructure, with automatic generation of a vulnerability report and prioritized recommendations."
    }
  },
  {
    id: "cle-usb-chiffree-32go",
    type: "hardware",
    digital: false,
    price: 35000,
    stock: 20,
    image: "assets/img/shop/usb-chiffree.jpg",
    fr: {
      name: "Clé USB chiffrée 32 Go",
      short: "Stockage sécurisé avec chiffrement matériel AES-256.",
      description: "Clé USB 32 Go avec chiffrement matériel AES-256 et code PIN physique. Idéale pour transporter des documents sensibles en toute sécurité."
    },
    en: {
      name: "Encrypted USB Drive 32GB",
      short: "Secure storage with AES-256 hardware encryption.",
      description: "32GB USB drive with AES-256 hardware encryption and a physical PIN pad. Ideal for carrying sensitive documents securely."
    }
  },
  {
    id: "webcam-cover-pack",
    type: "gadget",
    digital: false,
    price: 5000,
    stock: 100,
    image: "assets/img/shop/webcam-cover.jpg",
    fr: {
      name: "Pack caches webcam & micro (x5)",
      short: "Protège ta vie privée en un geste.",
      description: "Lot de 5 caches webcam coulissants + adhésif bloque-micro. Un geste simple pour se protéger contre l'espionnage via webcam ou microphone."
    },
    en: {
      name: "Webcam & Mic Cover Pack (x5)",
      short: "Protect your privacy in one move.",
      description: "Set of 5 sliding webcam covers + microphone-blocking stickers. A simple gesture to protect against webcam or microphone spying."
    }
  },
  {
    id: "formation-cyberhygiene-pdf",
    type: "logiciel",
    digital: true,
    price: 10000,
    stock: 200,
    image: "assets/img/shop/cyberhygiene-guide.jpg",
    fr: {
      name: "Guide Cyberhygiène pour équipes (PDF)",
      short: "Guide pratique de sensibilisation, prêt à diffuser.",
      description: "Un guide PDF prêt à diffuser à vos équipes : bonnes pratiques de cyberhygiène, gestion des mots de passe, détection du phishing. Livré par email après confirmation de paiement."
    },
    en: {
      name: "Cyber Hygiene Guide for Teams (PDF)",
      short: "Practical awareness guide, ready to distribute.",
      description: "A ready-to-distribute PDF guide for your teams: cyber hygiene best practices, password management, phishing detection. Delivered by email after payment confirmation."
    }
  }
];
