import React, { useState, useEffect } from "react";
import IPList from "./IPList";
import BonjourPage from "./BonjourPage";
import axios from "axios";

// URL dynamique : force 127.0.0.1 sur localhost (évite le bug IPv6 ::1 avec uvicorn)
const _host = window.location.hostname;
const API_URL = (_host === "localhost" || _host === "127.0.0.1" || _host === "")
  ? "http://127.0.0.1:8000"
  : `http://${_host}:8000`;

const navStyle = {
  display: "flex",
  gap: "12px",
  padding: "16px 24px",
  background: "#0f3460",
  alignItems: "center",
};

const btnStyle = (active) => ({
  padding: "8px 20px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "0.95rem",
  background: active ? "#56ccf2" : "rgba(255,255,255,0.12)",
  color: active ? "#0f3460" : "#fff",
  transition: "all 0.2s",
});

function BlockedScreen({ ip }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg, #1a0000, #3a0000)",
      color: "#fff", fontFamily: "Segoe UI, Arial, sans-serif",
    }}>
      <div style={{ fontSize: "5rem", marginBottom: "16px" }}>🚫</div>
      <h1 style={{ color: "#ff4c4c", fontSize: "2.5rem", margin: "0 0 12px" }}>Accès Refusé</h1>
      <p style={{ color: "#ffaaaa", fontSize: "1.2rem" }}>
        Votre IP <strong style={{ color: "#ff6b6b" }}>{ip}</strong> est bloquée par le firewall.
      </p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#1a1a2e", color: "#aaa",
      fontSize: "1.3rem", fontFamily: "Segoe UI, Arial, sans-serif",
    }}>
      ⏳ Identification en cours...
    </div>
  );
}

function App() {
  const [page, setPage] = useState("bonjour");
  const [userInfo, setUserInfo] = useState(null); // { ip, is_admin, is_blocked }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/whoami`)
      .then((res) => {
        setUserInfo(res.data);
        // Admin → afficher dashboard par défaut
        if (res.data.is_admin) setPage("dashboard");
      })
      .catch(() => {
        // Impossible de contacter l'API → afficher Bonjour par défaut
        setUserInfo({ ip: "inconnu", is_admin: false, is_blocked: false });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (userInfo?.is_blocked) return <BlockedScreen ip={userInfo.ip} />;

  return (
    <div style={{ minHeight: "100vh", background: "#1a1a2e", color: "#fff" }}>
      {/* Barre de navigation */}
      <nav style={navStyle}>
        <span style={{ fontSize: "1.3rem", fontWeight: "bold", marginRight: "20px" }}>
          🔥 Firewall Dynamique
        </span>

        {/* Onglet Dashboard uniquement pour l'admin */}
        {userInfo?.is_admin && (
          <button style={btnStyle(page === "dashboard")} onClick={() => setPage("dashboard")}>
            🛡️ Dashboard Admin
          </button>
        )}

        <button style={btnStyle(page === "bonjour")} onClick={() => setPage("bonjour")}>
          👋 Page Bonjour
        </button>

        {/* Indicateur d'IP */}
        <span style={{
          marginLeft: "auto", fontSize: "0.85rem", color: "#56ccf2",
          background: "rgba(86,204,242,0.1)", padding: "4px 12px", borderRadius: "20px"
        }}>
          {userInfo?.is_admin ? "👑 Admin" : "🌐 Invité"} — {userInfo?.ip}
        </span>
      </nav>

      {/* Contenu */}
      {page === "dashboard" && userInfo?.is_admin && <IPList apiUrl={API_URL} />}
      {page === "bonjour" && <BonjourPage apiUrl={API_URL} />}
    </div>
  );
}

export default App;

