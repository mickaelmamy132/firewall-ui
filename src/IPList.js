import React, { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";
const TOKEN = "MyToken";

export default function IPList() {
  const [ips, setIps] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [ports, setPorts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedIP, setSelectedIP] = useState(null);
  const [reason, setReason] = useState("");

  const normalizeIP = (ip) => ip?.trim();
  const isBlocked = (ip) =>
    blocked.some((b) => normalizeIP(b.ip) === normalizeIP(ip));
  const activeIps = ips.filter((c) => !isBlocked(c.ipAddress));

  /* ================= LOAD ================= */
  const loadBlocked = async () => {
    try {
      const res = await axios.get(`${API_URL}/list`, {
        headers: { Authorization: `Bearer ${TOKEN}` },
      });
      setBlocked(res.data.blocks || []);
    } catch {
      setBlocked([]);
    }
  };

  const loadClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/clients`);
      setIps(res.data || []);
    } catch {
      setIps([]);
    }
  };

  useEffect(() => {
    loadClients();
    loadBlocked();
  }, []);

  /* ================= ACTIONS ================= */
  const openModal = (ip) => {
    setSelectedIP(ip);
    setReason("");
    setShowModal(true);
  };

  const confirmBlock = async () => {
    if (!reason.trim()) {
      alert("Veuillez entrer une raison");
      return;
    }

    await axios.post(
      `${API_URL}/block`,
      {
        ip: selectedIP,
        port: ports[selectedIP] ? Number(ports[selectedIP]) : null,
        reason,
      },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    setPorts((p) => ({ ...p, [selectedIP]: "" }));
    setReason("");
    setShowModal(false);
    loadBlocked();
    loadClients();
  };

  const unblockIP = async (ip) => {
    await axios.post(
      `${API_URL}/unblock`,
      { ip },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    loadBlocked();
    loadClients();
  };

  const blockAll = async () => {
    for (const c of activeIps) {
      await axios.post(
        `${API_URL}/block`,
        { ip: c.ipAddress, reason: "Blocage global" },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
    }
    loadBlocked();
    loadClients();
  };

  const unblockAll = async () => {
    for (const b of blocked) {
      await unblockIP(b.ip);
    }
  };

  /* ================= STYLES ================= */
  const card = {
    background: "#fff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    marginBottom: 30,
  };
  const button = { padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600 };
  const btnDanger = { ...button, background: "#e53935", color: "#fff" };
  const btnSuccess = { ...button, background: "#43a047", color: "#fff" };
  const btnGrey = { ...button, background: "#eee", color: "#333" };
  const tableStyle = { width: "100%", borderCollapse: "collapse" };
  const thtd = { padding: 10, borderBottom: "1px solid #eee", textAlign: "left" };
  const overlay = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  const modal = { background: "#fff", padding: 24, borderRadius: 12, width: 400, boxShadow: "0 20px 50px rgba(0,0,0,0.2)" };
  const textarea = { width: "100%", minHeight: 80, padding: 12, borderRadius: 8, border: "1px solid #ddd", marginBottom: 16, resize: "none" };
  const label = { display: "block", fontWeight: 600, marginBottom: 6, marginTop: 12 };

  return (
    <div style={{ padding: 30, background: "#f4f6f8", minHeight: "100vh" }}>
      <h1 style={{ marginBottom: 30 }}>🛡️ Gestion des IP réseau</h1>

      {/* ================= IP ACTIVES ================= */}
      <div style={card}>
        <h2>🟢 IP actives</h2>
        <button style={{ ...btnDanger, marginBottom: 15 }} onClick={blockAll} disabled={activeIps.length === 0}>
          Bloquer toutes les IP
        </button>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtd}>IP</th>
              <th style={thtd}>MAC</th>
              <th style={thtd}>Constructeur</th>
              <th style={thtd}>Port</th>
              <th style={thtd}>Action</th>
            </tr>
          </thead>
          <tbody>
            {activeIps.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: "center", padding: 20 }}>Aucune IP active</td></tr>
            ) : (
              activeIps.map((c) => (
                <tr key={c.ipAddress}>
                  <td style={thtd}>{c.ipAddress}</td>
                  <td style={thtd}>{c.macAddress}</td>
                  <td style={thtd}>{c.vendor}</td>
                  <td style={thtd}>
                    <input
                      type="number"
                      placeholder="22"
                      value={ports[c.ipAddress] || ""}
                      onChange={(e) => setPorts({ ...ports, [c.ipAddress]: e.target.value })}
                      style={{ width: 70, padding: 6, borderRadius: 6, border: "1px solid #ccc" }}
                    />
                  </td>
                  <td style={thtd}>
                    <button style={btnDanger} onClick={() => openModal(c.ipAddress)}>Bloquer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= IP BLOQUÉES ================= */}
      <div style={card}>
        <h2>🔴 IP bloquées</h2>
        <button style={{ ...btnSuccess, marginBottom: 15 }} onClick={unblockAll} disabled={blocked.length === 0}>
          Débloquer toutes les IP
        </button>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thtd}>IP</th>
              <th style={thtd}>Port</th>
              <th style={thtd}>Raison</th>
              <th style={thtd}>Action</th>
            </tr>
          </thead>
          <tbody>
            {blocked.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: "center", padding: 20 }}>Aucune IP bloquée</td></tr>
            ) : (
              blocked.map((b) => (
                <tr key={b.ip}>
                  <td style={thtd}>{b.ip}</td>
                  <td style={thtd}>{b.port ?? "-"}</td>
                  <td style={thtd}>{b.reason || "-"}</td>
                  <td style={thtd}>
                    <button style={btnSuccess} onClick={() => unblockIP(b.ip)}>Débloquer</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= MODALE ================= */}
      {showModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3>🔒 Bloquer {selectedIP}</h3>
            <label style={label}>Raison du blocage</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Scan de ports, tentative d’intrusion..."
              style={textarea}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button style={btnGrey} onClick={() => setShowModal(false)}>Annuler</button>
              <button style={btnDanger} onClick={confirmBlock} disabled={!reason.trim()}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
