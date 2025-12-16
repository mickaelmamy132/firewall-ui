import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://127.0.0.1:8000";
const TOKEN = "MyToken"; // change en prod

export default function IPList() {
  const [ips, setIps] = useState([]);
  const [blocked, setBlocked] = useState([]);
  const [manualIP, setManualIP] = useState("");
  const [blockPorts, setBlockPorts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIP, setModalIP] = useState("");
  const [reason, setReason] = useState("");

  // Charger les IP bloquées
  const loadBlocked = async () => {
    try {
      const res = await axios.get(`${API_URL}/list`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      if (Array.isArray(res.data.blocks)) {
        setBlocked(res.data.blocks);
      } else {
        console.error("Format inattendu:", res.data);
        setBlocked([]);
      }
    } catch (err) {
      console.error("Erreur loadBlocked:", err);
      setBlocked([]);
    }
  };

  // Charger les IP du réseau
  const loadClients = async () => {
    try {
      const res = await axios.get(`${API_URL}/clients`);
      setIps(res.data);
    } catch (err) {
      console.error("Erreur loadClients:", err);
      setIps([]);
    }
  };

  useEffect(() => {
    loadClients();
    loadBlocked();
  }, []);

  // Bloquer une IP avec raison et port
  const blockIP = async (ip, reason = "") => {
    try {
      await axios.post(
        `${API_URL}/block`,
        { ip, port: blockPorts[ip] ? Number(blockPorts[ip]) : null, reason },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      loadBlocked();
      setBlockPorts(prev => ({ ...prev, [ip]: "" }));
      setModalOpen(false);
      setReason("");
    } catch (err) {
      console.error("Erreur blockIP:", err);
    }
  };

  // Débloquer une IP
  const unblockIP = async (ip) => {
    try {
      await axios.post(
        `${API_URL}/unblock`,
        { ip },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      loadBlocked();
    } catch (err) {
      console.error("Erreur unblockIP:", err);
    }
  };

  // Débloquer via champ manuel
  const handleManualUnblock = () => {
    if (!manualIP.trim()) {
      alert("Veuillez entrer une IP valide");
      return;
    }
    unblockIP(manualIP.trim());
    setManualIP("");
  };

  // Bloquer toutes les IPs affichées
  const blockAll = () => {
    ips.forEach(client => openModal(client.ipAddress));
  };

  // Débloquer toutes les IPs bloquées
  const unblockAll = () => {
    blocked.forEach(b => unblockIP(b.ip));
  };

  const openModal = (ip) => {
    setModalIP(ip);
    setModalOpen(true);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ marginBottom: "20px" }}>Liste des IP du réseau</h2>

      {/* Boutons globaux */}
      <div style={{ marginBottom: "20px" }}>
        <button onClick={blockAll} style={{ marginRight: "10px" }}>Bloquer toutes</button>
        <button onClick={unblockAll}>Débloquer toutes</button>
      </div>

      {/* Champ de déblocage manuel */}
      <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
        <h3>Débloquer une IP manuellement</h3>
        <input
          type="text"
          placeholder="Ex: 192.168.1.100"
          value={manualIP}
          onChange={(e) => setManualIP(e.target.value)}
          style={{ padding: "5px", marginRight: "10px" }}
        />
        <button onClick={handleManualUnblock}>Débloquer</button>
      </div>

      {/* Tableau des IPs */}
      <table style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>IP</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>MAC</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Constructeur</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>État</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Port</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Raison</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {ips.map((client) => {
            const blockedEntry = blocked.find(b => b.ip === client.ipAddress);
            const isBlocked = !!blockedEntry;
            return (
              <motion.tr
                key={client.ipAddress}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{client.ipAddress}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{client.macAddress}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>{client.vendor}</td>
                <td style={{ padding: "10px", border: "1px solid #ddd", color: isBlocked ? "red" : "green" }}>
                  {isBlocked ? "Bloqué" : "Actif"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  <input
                    type="number"
                    placeholder="ex: 22"
                    value={blockPorts[client.ipAddress] || ""}
                    onChange={(e) =>
                      setBlockPorts(prev => ({ ...prev, [client.ipAddress]: e.target.value }))
                    }
                    style={{ width: "70px" }}
                    disabled={isBlocked}
                  />
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {blockedEntry ? blockedEntry.reason || "—" : "—"}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {!isBlocked ? (
                    <button onClick={() => openModal(client.ipAddress)}>Bloquer</button>
                  ) : (
                    <button onClick={() => unblockIP(client.ipAddress)}>Débloquer</button>
                  )}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>

      {/* Modal pour raison */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000
            }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                width: "300px",
                textAlign: "center"
              }}
            >
              <h3>Raison du blocage</h3>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: SSH brute force"
                style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
              />
              <div>
                <button
                  onClick={() => blockIP(modalIP, reason)}
                  style={{ marginRight: "10px" }}
                >
                  Confirmer
                </button>
                <button onClick={() => setModalOpen(false)}>Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
