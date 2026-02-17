
import { AARTI_TYPES } from "../config";
import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

export default function AartiSelector({ selectedAarti, onSelect }) {
    return (
        <div className="aarti-selector">
            {AARTI_TYPES.map((aarti, index) => (
                <motion.button
                    key={aarti.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => onSelect(aarti)}
                    className={`aarti-button ${selectedAarti.name === aarti.name ? "active" : ""
                        }`}
                >
                    <Music2
                        size={24}
                        color={
                            selectedAarti.name === aarti.name ? "white" : "var(--color-saffron)"
                        }
                    />
                    <span>{aarti.name.replace(" Singing", "")}</span>
                </motion.button>
            ))}
        </div>
    );
}
