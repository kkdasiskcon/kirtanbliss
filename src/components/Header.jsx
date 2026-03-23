
import { motion } from "framer-motion";

export default function Header() {
    return (
        <motion.header
            className="app-header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="logo-icon" style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>🥁🪘✨</div>
            <h1>ISKCON NVCC</h1>
            <h2 style={{ color: "var(--text-secondary)" }}>Kirtan Allocation System</h2>
            <p className="subtitle" style={{ color: "var(--text-secondary)" }}>Fair rotation for arati singing assignments</p>
        </motion.header>
    );
}
