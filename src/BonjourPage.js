import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────
// Sites vitrines disponibles (choix aléatoire)
// ─────────────────────────────────────────────────
const VITRINES = [
  {
    id: "coffee",
    name: "Café Lumière",
    tagline: "L'art du café, revisité",
    description: "Depuis 1987, nous torréfions chaque grain avec passion pour vous offrir une expérience unique. Venez découvrir nos mélanges exclusifs et notre ambiance chaleureuse.",
    cta: "Réserver une table",
    accent: "#d4a847",
    bg: "linear-gradient(135deg, #1a0e00, #2d1a00, #1a0e00)",
    emoji: "☕",
    stats: [
      { label: "Origines", value: "12+" },
      { label: "Recettes", value: "38" },
      { label: "Clients/jour", value: "200+" },
    ],
    features: ["Torréfaction artisanale", "Lait d'avoine bio", "Espace coworking", "Wifi gratuit"],
  },
  {
    id: "tech",
    name: "NovaTech Solutions",
    tagline: "L'innovation au service de votre entreprise",
    description: "Nous concevons des logiciels sur mesure, des applications mobiles et des infrastructures cloud pour propulser votre business vers l'avenir.",
    cta: "Demander un devis",
    accent: "#56ccf2",
    bg: "linear-gradient(135deg, #0a0a1a, #0d1b2a, #0a0a1a)",
    emoji: "🚀",
    stats: [
      { label: "Projets livrés", value: "150+" },
      { label: "Clients satisfaits", value: "98%" },
      { label: "Années d'expérience", value: "10" },
    ],
    features: ["Développement web & mobile", "Cloud AWS / Azure", "Cybersécurité", "Support 24/7"],
  },
  {
    id: "restaurant",
    name: "Saveurs du Monde",
    tagline: "Un voyage culinaire à chaque bouchée",
    description: "Notre chef étoilé vous transporte aux quatre coins du monde à travers des plats fusion inédits, préparés avec des produits frais et locaux.",
    cta: "Voir le menu",
    accent: "#e84a5f",
    bg: "linear-gradient(135deg, #1a0008, #2d0010, #1a0008)",
    emoji: "🍽️",
    stats: [
      { label: "Plats signature", value: "24" },
      { label: "Pays représentés", value: "18" },
      { label: "Étoile Michelin", value: "⭐" },
    ],
    features: ["Menu dégustation", "Vins sélectionnés", "Terrasse panoramique", "Privatisation possible"],
  },
  {
    id: "photo",
    name: "Studio Lumens",
    tagline: "Votre histoire mérite les plus belles images",
    description: "Photographe professionnel spécialisé dans les portraits, mariages et événements d'entreprise. Chaque cliché est une œuvre unique.",
    cta: "Voir le portfolio",
    accent: "#a78bfa",
    bg: "linear-gradient(135deg, #0d0015, #1a0030, #0d0015)",
    emoji: "📷",
    stats: [
      { label: "Séances réalisées", value: "500+" },
      { label: "Mariages", value: "120" },
      { label: "Prix remportés", value: "8" },
    ],
    features: ["Portrait & Mode", "Mariage & Événement", "Photo corporate", "Retouche professionnelle"],
  },
];

// ─────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────
export default function BonjourPage({ apiUrl = "http://127.0.0.1:8000" }) {
  const [error, setError] = useState(null);
  const [clientIp, setClientIp] = useState(null);
  const [loading, setLoading] = useState(true);
  // Choisir un site vitrine aléatoire une seule fois
  const [vitrine] = useState(() => VITRINES[Math.floor(Math.random() * VITRINES.length)]);

  useEffect(() => {
    axios
      .get(`${apiUrl}/bonjour`)
      .then((res) => {
        setClientIp(res.data.ip);
        setError(null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 403) {
          setError(err.response.data.detail || "Accès refusé : votre IP est bloquée.");
        } else {
          setError("Impossible de contacter le serveur.");
        }
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", background: "#0a0a0a", color: "#aaa",
        fontSize: "1.2rem", fontFamily: "Segoe UI, Arial, sans-serif",
      }}>
        ⏳ Chargement…
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #1a0000, #2d0000)",
        color: "#fff", fontFamily: "Segoe UI, Arial, sans-serif",
      }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            textAlign: "center", padding: "50px 60px",
            border: "2px solid #ff4c4c55", borderRadius: "18px",
            background: "rgba(255,60,60,0.08)", maxWidth: "480px",
          }}
        >
          <div style={{ fontSize: "5rem", marginBottom: "16px" }}>🚫</div>
          <h1 style={{ color: "#ff4c4c", fontSize: "2rem", margin: "0 0 12px" }}>Accès Refusé</h1>
          <p style={{ color: "#ffaaaa", lineHeight: 1.7 }}>{error}</p>
        </motion.div>
      </div>
    );
  }

  // ── Afficher le site vitrine ──
  const { accent, bg, emoji, name, tagline, description, cta, stats, features } = vitrine;

  return (
    <div style={{
      minHeight: "100vh",
      background: bg,
      fontFamily: "'Segoe UI', Arial, sans-serif",
      color: "#fff",
    }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 24px",
          position: "relative",
        }}
      >
        {/* IP badge discret */}
        <div style={{
          position: "absolute", top: "20px", right: "20px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "20px", padding: "4px 12px",
          fontSize: "0.75rem", color: "rgba(255,255,255,0.4)",
        }}>
          🌐 {clientIp}
        </div>

        {/* Logo/Emoji */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3 }}
          style={{ fontSize: "5rem", marginBottom: "20px" }}
        >
          {emoji}
        </motion.div>

        {/* Nom du site */}
        <h1 style={{
          fontSize: "3.5rem", fontWeight: "900",
          margin: "0 0 10px",
          background: `linear-gradient(90deg, ${accent}, #fff)`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          letterSpacing: "-1px",
        }}>
          {name}
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: "1.3rem", color: accent,
          margin: "0 0 24px", fontStyle: "italic", opacity: 0.9,
        }}>
          {tagline}
        </p>

        {/* Description */}
        <p style={{
          maxWidth: "560px", lineHeight: 1.8,
          color: "rgba(255,255,255,0.75)", fontSize: "1.05rem",
          margin: "0 0 40px",
        }}>
          {description}
        </p>

        {/* Bouton CTA */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: "14px 36px",
            background: `linear-gradient(135deg, ${accent}, ${accent}aa)`,
            color: "#000", border: "none", borderRadius: "50px",
            fontSize: "1.05rem", fontWeight: "bold",
            cursor: "pointer", marginBottom: "60px",
            boxShadow: `0 8px 30px ${accent}44`,
          }}
        >
          {cta} →
        </motion.button>

        {/* Stats */}
        <div style={{
          display: "flex", gap: "40px", flexWrap: "wrap",
          justifyContent: "center", marginBottom: "60px",
        }}>
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.15 }}
              style={{ textAlign: "center" }}
            >
              <div style={{ fontSize: "2.2rem", fontWeight: "900", color: accent }}>{s.value}</div>
              <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", marginTop: "4px" }}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center",
        }}>
          {features.map((f, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                padding: "7px 18px",
                background: `${accent}22`,
                border: `1px solid ${accent}55`,
                borderRadius: "30px",
                fontSize: "0.88rem",
                color: accent,
              }}
            >
              ✓ {f}
            </motion.span>
          ))}
        </div>

        {/* Footer discret */}
        <div style={{
          position: "absolute", bottom: "16px",
          fontSize: "0.75rem", color: "rgba(255,255,255,0.2)",
        }}>
          Protégé par DynFW • Firewall Dynamique
        </div>
      </motion.div>
    </div>
  );
}
