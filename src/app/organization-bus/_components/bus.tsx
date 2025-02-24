
'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { redirectToDashboard } from '../action';


const LoadingPage = () => {

  useEffect(() => {
    const timer = setTimeout(() => {
    redirectToDashboard()
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const dotVariants = {
    initial: {
      y: 0,
      scale: 1
    },
    animate: {
      y: [-10, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex space-x-4"
      >
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            variants={dotVariants}
            className="w-4 h-4 rounded-full bg-primary"
          />
        ))}
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-2xl font-semibold text-foreground"
      >
        Loading...
      </motion.h2>
      <motion.div
        initial={{ width: '0%' }}
        animate={{ width: '300px' }}
        transition={{ duration: 1 }}
        className="h-1 bg-primary/20 mt-6 rounded-full relative overflow-hidden"
      >
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.5,
            ease: 'linear'
          }}
          className="absolute inset-0 bg-primary"
        />
      </motion.div>
    </div>
  );
};

export default LoadingPage;