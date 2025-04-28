import { motion } from 'framer-motion';

type MessageAnimationProps = {
  children: React.ReactNode;
  role: 'user' | 'assistant';
};

export default function MessageAnimation({ children, role }: MessageAnimationProps) {
  return (
    <motion.div
      initial={{ 
        opacity: 0,
        x: role === 'user' ? 20 : -20,
        y: 10
      }}
      animate={{ 
        opacity: 1,
        x: 0,
        y: 0
      }}
      transition={{
        duration: 0.3,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  );
}
