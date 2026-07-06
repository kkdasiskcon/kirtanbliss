
import { motion } from "framer-motion";

export default function Header() {
    return (
        <motion.header
            className="app-header"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div style={{ fontSize: "2rem", marginBottom: "0.4rem", lineHeight: 1 }}>🥁🪘✨</div>
            <h1>ISKCON NVCC</h1>
            <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                Kirtan Allocation System
            </p>
        </motion.header>
    );
}
