
import { useState, useEffect } from "react";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginGate({ children }) {
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const CORRECT_PASSWORD = "108108";

    useEffect(() => {
        // Check if user is already authenticated in this session
        const authStatus = localStorage.getItem("iskcon_kirtan_auth");
        if (authStatus === "true") {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = (e) => {
        e.preventDefault();
        if (password === CORRECT_PASSWORD) {
            setIsAuthenticated(true);
            setError(false);
            localStorage.setItem("iskcon_kirtan_auth", "true");
        } else {
            setError(true);
            setPassword("");
            // Shake effect or feedback
            setTimeout(() => setError(false), 500);
        }
    };

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f9ff" }}>
                <div className="spinner-small" style={{ width: "40px", height: "40px", borderTopColor: "var(--color-saffron)" }}></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return children;
    }

    return (
        <div style={{
            height: "100vh",
            width: "100vw",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
            padding: "1rem",
            boxSizing: "border-box",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 999999
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    maxWidth: "400px",
                    width: "100%",
                    background: "white",
                    padding: "2.5rem 2rem",
                    borderRadius: "24px",
                    boxShadow: "0 25px 50px -12px rgba(234, 88, 12, 0.2)",
                    textAlign: "center",
                    border: "1px solid #fed7aa"
                }}
            >
                <div style={{
                    background: "var(--color-saffron-light)",
                    width: "60px",
                    height: "60px",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    color: "var(--color-saffron-dark)"
                }}>
                    <Lock size={32} />
                </div>

                <h1 style={{ fontSize: "1.75rem", color: "var(--text-primary)", margin: "0 0 0.5rem 0", fontWeight: 800 }}>
                    Kirtan Bliss
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", fontSize: "0.95rem" }}>
                    Please enter the access code to continue.
                </p>

                <form onSubmit={handleLogin}>
                    <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                            style={{
                                width: "100%",
                                padding: "1rem 1rem 1rem 1rem",
                                borderRadius: "14px",
                                border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`,
                                fontSize: "1.1rem",
                                outline: "none",
                                transition: "all 0.3s",
                                textAlign: "center",
                                letterSpacing: "0.3em",
                                background: "#f8fafc",
                                boxSizing: "border-box"
                            }}
                        />
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        color: "#ef4444",
                                        fontSize: "0.85rem",
                                        marginTop: "0.5rem",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "0.4rem",
                                        fontWeight: 600
                                    }}
                                >
                                    <ShieldAlert size={14} /> Incorrect access code
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        type="submit"
                        className="modal-button primary"
                        style={{
                            width: "100%",
                            padding: "1rem",
                            justifyContent: "center",
                            fontSize: "1.1rem",
                            borderRadius: "14px",
                            background: "linear-gradient(135deg, var(--color-saffron), var(--color-saffron-dark))",
                            boxShadow: "0 10px 20px rgba(234, 88, 12, 0.3)"
                        }}
                    >
                        <LogIn size={20} /> Access Portal
                    </button>
                </form>

                <div style={{ marginTop: "2rem", fontSize: "0.8rem", color: "#94a3b8" }}>
                    Authorized Personnel Only
                </div>
            </motion.div >
        </div >
    );
}
