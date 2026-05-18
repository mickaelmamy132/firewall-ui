import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const TOKEN = "MyToken";

const styles = {
  container: {
    padding: "24px",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    color: "#e0e0e0",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "20px 24px",
    marginBottom: "24px",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "#56ccf2",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    padding: "10px 14px",
    textAlign: "left",
    background: "rgba(86,204,242,0.1)",
    color: "#56ccf2",
    fontWeight: "600",
    fontSize: "0.85rem",
    borderBottom: "1px solid rgba(86,204,242,0.2)",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontSize: "0.9rem",
  },
  badge: (blocked) => ({
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "bold",
    background: blocked ? "rgba(255,60,60,0.2)" : "rgba(60,220,100,0.2)",
    color: blocked ? "#ff6b6b" : "#4edc7a",
    border: `1px solid ${blocked ? "#ff4c4c55" : "#4edc7a55"}`,
  }),
  btnBlock: {
    padding: "5px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.82rem",
    background: "rgba(255,60,60,0.25)",
    color: "#ff6b6b",
    transition: "all 0.2s",
  },
  btnUnblock: {
    padding: "5px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.82rem",
    background: "rgba(60,220,100,0.2)",
    color: "#4edc7a",
    transition: "all 0.2s",
  },
  btnRefresh: {
    padding: "7px 18px",
    border: "1px solid #56ccf2",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.88rem",
    background: "transparent",
    color: "#56ccf2",
    transition: "all 0.2s",
    marginLeft: "auto",
    display: "block",
  },
  input: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "8px",
    color: "#fff",
    padding: "8px 12px",
    fontSize: "0.9rem",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  formRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: 1,
    minWidth: "140px",
  },
  label: {
    fontSize: "0.78rem",
    color: "#aaa",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  btnSubmit: {
    padding: "9px 22px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.92rem",
    background: "linear-gradient(135deg, #ff4c4c, #c0392b)",
    color: "#fff",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
    alignSelf: "flex-end",
  },
  alert: (type) => ({
    padding: "10px 16px",
    borderRadius: "8px",
    marginBottom: "12px",
    fontSize: "0.9rem",
    background: type === "success" ? "rgba(60,220,100,0.15)" : "rgba(255,60,60,0.15)",
    color: type === "success" ? "#4edc7a" : "#ff6b6b",
    border: `1px solid ${type === "success" ? "#4edc7a44" : "#ff4c4c44"}`,
  }),
};

export default function IPList({ apiUrl = "http://127.0.0.1:8000" }) {
  const [clients, setClients] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Formulaire blocage manuel
  const [manualIp, setManualIp] = useState("");
  const [manualPort, setManualPort] = useState("");
  const [manualReason, setManualReason] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // Modal raison pour blocage depuis tableau
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIp, setModalIp] = useState("");
  const [modalPort, setModalPort] = useState("");
  const [modalReason, setModalReason] = useState("");

  const headers = { Authorization: `Bearer ${TOKEN}` };

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadBlocked = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/list`, { headers });
      setBlocked(Array.isArray(res.data.blocks) ? res.data.blocks : []);
    } catch {
      setBlocked([]);
    }
  }, [apiUrl]);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/clients`);
      setClients(Array.isArray(res.data) ? res.data : []);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    loadClients();
    loadBlocked();
    const interval = setInterval(loadBlocked, 10000);
    return () => clearInterval(interval);
  }, [loadClients, loadBlocked]);

  // Bloquer une IP
  const blockIP = async (ip, port, reason) => {
    try {
      await axios.post(
        `${apiUrl}/block`,
        { ip, port: port ? Number(port) : null, reason: reason || "manuel" },
        { headers }
      );
      await loadBlocked();
      showNotif(`✅ IP ${ip} bloquée avec succès`);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Erreur lors du blocage";
      showNotif(`❌ ${detail}`, "error");
    }
  };

  // Débloquer une IP
  const unblockIP = async (ip) => {
    try {
      await axios.post(`${apiUrl}/unblock`, { ip }, { headers });
      await loadBlocked();
      showNotif(`✅ IP ${ip} débloquée`);
    } catch (err) {
      const detail = err?.response?.data?.detail || "Erreur lors du déblocage";
      showNotif(`❌ ${detail}`, "error");
    }
  };

  // Soumettre le formulaire de blocage manuel
  const handleManualBlock = async (e) => {
    e.preventDefault();
    if (!manualIp.trim()) {
      showNotif("❌ Veuillez entrer une IP valide", "error");
      return;
    }
    setManualLoading(true);
    await blockIP(manualIp.trim(), manualPort, manualReason);
    setManualIp("");
    setManualPort("");
    setManualReason("");
    setManualLoading(false);
  };

  // Ouvrir modal blocage
  const openModal = (ip) => {
    setModalIp(ip);
    setModalPort("");
    setModalReason("");
    setModalOpen(true);
  };

  const confirmModalBlock = async () => {
    await blockIP(modalIp, modalPort, modalReason);
    setModalOpen(false);
  };

  const isBlocked = (ip) => blocked.find((b) => b.ip === ip);
  const getBlockedEntry = (ip) => blocked.find((b) => b.ip === ip);

  return (
    <div style={styles.container}>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={styles.alert(notification.type)}
          >
            {notification.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bloc 1 : Formulaire de blocage manuel */}
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔒 Bloquer une IP manuellement</div>
        <form onSubmit={handleManualBlock}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Adresse IP *</label>
              <input
                style={styles.input}
                type="text"
                placeholder="ex: 192.168.1.100"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                required
              />
            </div>
            <div style={{ ...styles.formGroup, maxWidth: "120px" }}>
              <label style={styles.label}>Port (optionnel)</label>
              <input
                style={styles.input}
                type="number"
                placeholder="ex: 22"
                value={manualPort}
                onChange={(e) => setManualPort(e.target.value)}
                min="1"
                max="65535"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Raison</label>
              <input
                style={styles.input}
                type="text"
                placeholder="ex: SSH brute force"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
              />
            </div>
            <button
              type="submit"
              style={{ ...styles.btnSubmit, opacity: manualLoading ? 0.6 : 1 }}
              disabled={manualLoading}
            >
              {manualLoading ? "⏳..." : "🚫 Bloquer"}
            </button>
          </div>
        </form>
      </div>

      {/* Bloc 2 : Tableau des IP du réseau */}
      <div style={styles.card}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ ...styles.cardTitle, marginBottom: 0 }}>
            🌐 Machines connectées sur le réseau
          </div>
          <button
            style={styles.btnRefresh}
            onClick={() => { loadClients(); loadBlocked(); }}
          >
            🔄 Actualiser
          </button>
        </div>

        {loading ? (
          <div style={{ color: "#888", padding: "20px 0", textAlign: "center" }}>
            ⏳ Scan du réseau en cours (arp-scan)…
          </div>
        ) : clients.length === 0 ? (
          <div style={{ color: "#888", padding: "20px 0", textAlign: "center" }}>
            Aucune machine détectée. Vérifiez que <code>arp-scan</code> est installé
            et que l'API tourne en sudo.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Adresse IP</th>
                  <th style={styles.th}>Adresse MAC</th>
                  <th style={styles.th}>Constructeur</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Raison</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {clients.map((client) => {
                    const entry = getBlockedEntry(client.ipAddress);
                    const blocked = !!entry;
                    return (
                      <motion.tr
                        key={client.ipAddress}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td style={{ ...styles.td, fontFamily: "monospace", color: "#56ccf2" }}>
                          {client.ipAddress}
                        </td>
                        <td style={{ ...styles.td, fontFamily: "monospace", fontSize: "0.82rem" }}>
                          {client.macAddress}
                        </td>
                        <td style={styles.td}>{client.vendor || "—"}</td>
                        <td style={styles.td}>
                          <span style={styles.badge(blocked)}>
                            {blocked ? "Bloquée" : "Active"}
                          </span>
                        </td>
                        <td style={{ ...styles.td, fontSize: "0.82rem", color: "#aaa" }}>
                          {entry?.reason || "—"}
                        </td>
                        <td style={styles.td}>
                          {!blocked ? (
                            <button
                              style={styles.btnBlock}
                              onClick={() => openModal(client.ipAddress)}
                            >
                              🚫 Bloquer
                            </button>
                          ) : (
                            <button
                              style={styles.btnUnblock}
                              onClick={() => unblockIP(client.ipAddress)}
                            >
                              ✅ Débloquer
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bloc 3 : IPs bloquées (pas dans le scan) */}
      {blocked.filter(b => !clients.find(c => c.ipAddress === b.ip)).length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardTitle}>📋 Autres IPs bloquées</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Adresse IP</th>
                <th style={styles.th}>Raison</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {blocked
                .filter(b => !clients.find(c => c.ipAddress === b.ip))
                .map((b) => (
                  <tr key={b.ip}>
                    <td style={{ ...styles.td, fontFamily: "monospace", color: "#ff6b6b" }}>{b.ip}</td>
                    <td style={{ ...styles.td, color: "#aaa" }}>{b.reason || "—"}</td>
                    <td style={styles.td}>
                      <button style={styles.btnUnblock} onClick={() => unblockIP(b.ip)}>
                        ✅ Débloquer
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal blocage avec raison */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
              background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <motion.div
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              style={{
                background: "#1e2a3a",
                border: "1px solid rgba(255,100,100,0.3)",
                borderRadius: "14px",
                padding: "28px 32px",
                width: "360px",
                color: "#fff",
              }}
            >
              <h3 style={{ margin: "0 0 8px", color: "#ff6b6b" }}>🚫 Bloquer {modalIp}</h3>
              <p style={{ color: "#aaa", margin: "0 0 18px", fontSize: "0.88rem" }}>
                Renseignez un port et une raison (optionnel).
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Port (optionnel)</label>
                  <input
                    style={styles.input}
                    type="number"
                    placeholder="ex: 22"
                    value={modalPort}
                    onChange={(e) => setModalPort(e.target.value)}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Raison</label>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="ex: SSH brute force"
                    value={modalReason}
                    onChange={(e) => setModalReason(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && confirmModalBlock()}
                  />
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "4px" }}>
                  <button
                    style={{ ...styles.btnSubmit, flex: 1 }}
                    onClick={confirmModalBlock}
                  >
                    Confirmer
                  </button>
                  <button
                    style={{ ...styles.btnRefresh, display: "inline-block", margin: 0, flex: 1 }}
                    onClick={() => setModalOpen(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
