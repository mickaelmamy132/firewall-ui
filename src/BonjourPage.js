import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function BonjourPage({ apiUrl = "http://127.0.0.1:8000" }) {
  const API_URL = apiUrl;

  const [message, setMessage] = useState(null);
  const [clientIp, setClientIp] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API_URL}/bonjour`)
      .then((res) => {
        setMessage(res.data.message);
        setClientIp(res.data.ip);
        setError(null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 403) {
          setError(err.response.data.detail || "Accès refusé : votre IP est bloquée.");
        } else {
          setError("Impossible de contacter le serveur.");
        }
        setMessage(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ color: "#aaa", fontSize: "1.2rem" }}
        >
          ⏳ Vérification en cours...
        </motion.div>
      ) : error ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            background: "rgba(255, 60, 60, 0.15)",
            border: "2px solid #ff4c4c",
            borderRadius: "16px",
            padding: "40px 60px",
            textAlign: "center",
            color: "#ff6b6b",
            maxWidth: "500px",
          }}
        >
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>🚫</div>
          <h2 style={{ margin: "0 0 12px", fontSize: "1.8rem", color: "#ff4c4c" }}>
            Accès Refusé
          </h2>
          <p style={{ margin: 0, fontSize: "1.1rem", lineHeight: 1.6 }}>{error}</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "2px solid rgba(100, 220, 100, 0.5)",
            borderRadius: "16px",
            padding: "50px 70px",
            textAlign: "center",
            color: "#fff",
            maxWidth: "520px",
            backdropFilter: "blur(12px)",
            boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
          }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 10, 0] }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ fontSize: "4rem", marginBottom: "16px" }}
          >
            👋
          </motion.div>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "3rem",
              background: "linear-gradient(90deg, #56ccf2, #2f80ed)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {message}
          </h1>
          <p style={{ color: "#aad4f5", fontSize: "1rem", margin: 0 }}>
            ✅ Votre IP <strong style={{ color: "#56ccf2" }}>{clientIp}</strong> est autorisée.
          </p>
        </motion.div>
      )}
    </div>
  );
}
