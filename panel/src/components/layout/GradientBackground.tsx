'use client';

import { motion } from 'framer-motion';

/** Animated gradient orbs + grain overlay for all dashboard pages */
export function GradientBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
            {/* Orb 1 — gold, top-left */}
            <motion.div
                className="orb orb-gold"
                style={{ top: '-200px', left: '-150px' }}
                animate={{ y: [0, -30, 0], scale: [1, 1.08, 1] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Orb 2 — crimson, bottom-right */}
            <motion.div
                className="orb orb-crimson"
                style={{ bottom: '-150px', right: '-100px' }}
                animate={{ y: [0, 25, 0], scale: [1, 1.06, 1] }}
                transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
            />
            {/* Orb 3 — ice, center-right */}
            <motion.div
                className="orb orb-ice"
                style={{ top: '40%', right: '15%' }}
                animate={{ y: [0, -18, 0], scale: [1, 1.04, 1] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
            />
        </div>
    );
}
