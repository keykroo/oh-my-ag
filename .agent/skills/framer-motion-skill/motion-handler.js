import { motion } from 'framer-motion';

export const springTransition = {
    type: "spring",
    stiffness: 260,
    damping: 20
};

export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

// Use this wrapper to ensure no conflicts with 'oh-my-ag' layout
export const MotionBox = ({ children, ...props }) => (
    <motion.div {...fadeInUp} transition={springTransition} {...props}>
        {children}
    </motion.div>
);