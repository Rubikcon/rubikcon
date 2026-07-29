import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  start?: boolean;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 2, start = true }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    setHasMounted(true);
    if (start) {
      spring.set(value);
    }
  }, [value, spring, start]);

  if (!hasMounted) {
    return <span>0</span>;
  }

  return <motion.span>{display}</motion.span>;
};
