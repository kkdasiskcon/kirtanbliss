
import { createPortal } from "react-dom";

/**
 * Portal component to render children outside the standard DOM hierarchy.
 * Useful for escaping overflow:hidden or transform/filter traps on parent elements.
 */
export default function Portal({ children }) {
    return createPortal(children, document.body);
}
