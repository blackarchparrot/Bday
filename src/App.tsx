/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { Ghost, Skull, Gift, Eye, Moon, Wind, Zap, Bug } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Components ---

const EyeFollower = ({ mousePos }: { mousePos: { x: number; y: number } }) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (eyeRef.current) {
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      const angle = Math.atan2(mousePos.y - eyeY, mousePos.x - eyeX);
      setRotation(angle * (180 / Math.PI));
    }
  }, [mousePos]);

  return (
    <div ref={eyeRef} className="relative w-12 h-12 bg-white rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-inner">
      <motion.div
        animate={{ rotate: rotation }}
        className="w-6 h-6 bg-black rounded-full flex items-center justify-end pr-1"
      >
        <div className="w-2 h-2 bg-white rounded-full opacity-60" />
      </motion.div>
    </div>
  );
};

const Fog = () => (
  <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden opacity-40">
    <motion.div
      animate={{ x: ['-100%', '100%'] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      className="absolute top-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-gray-400/20 to-transparent blur-3xl"
    />
    <motion.div
      animate={{ x: ['100%', '-100%'] }}
      transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      className="absolute bottom-0 left-0 w-[200%] h-full bg-gradient-to-r from-transparent via-gray-500/20 to-transparent blur-3xl"
    />
  </div>
);

const BloodDrip = ({ text }: { text: string }) => {
  return (
    <div className="relative inline-block group">
      <h1 className="text-6xl md:text-8xl font-bold text-red-700 tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
        {text}
      </h1>
      <div className="absolute top-full left-0 w-full flex justify-around pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            whileInView={{ height: [0, 40, 20, 60, 30] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            className="w-1 bg-red-800 rounded-b-full opacity-80 group-hover:opacity-100 group-hover:bg-red-600 transition-colors"
          />
        ))}
      </div>
    </div>
  );
};

const Spider = () => {
  const [dropped, setDropped] = useState(false);
  return (
    <div className="absolute top-0 right-20 z-30 cursor-pointer" onClick={() => setDropped(!dropped)}>
      <motion.div
        animate={{ y: dropped ? 300 : 0 }}
        transition={{ type: 'spring', stiffness: 50 }}
        className="relative flex flex-col items-center"
      >
        <div className="w-0.5 h-screen bg-white/20 absolute bottom-full" />
        <Bug className="text-black fill-current w-12 h-12 rotate-180" />
      </motion.div>
    </div>
  );
};

const Zombie = ({ delay }: { delay: number }) => (
  <motion.div
    initial={{ x: '-100%', y: '80%' }}
    animate={{ x: '120%' }}
    transition={{ duration: 15, delay, repeat: Infinity, ease: 'linear' }}
    className="fixed z-20 pointer-events-none"
  >
    <div className="flex flex-col items-center">
      <Skull className="w-16 h-16 text-green-800" />
      <div className="w-8 h-12 bg-green-900 rounded-t-lg -mt-2" />
    </div>
  </motion.div>
);

const Candle = ({ onBlow }: { onBlow: () => void }) => {
  const [lit, setLit] = useState(true);
  const handleClick = () => {
    if (lit) {
      setLit(false);
      onBlow();
    }
  };

  return (
    <div className="flex flex-col items-center cursor-pointer group" onClick={handleClick}>
      <AnimatePresence>
        {lit && (
          <motion.div
            exit={{ opacity: 0, scale: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
              y: [0, -2, 0]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-4 h-6 bg-orange-500 rounded-full blur-[2px] shadow-[0_0_10px_orange]"
          />
        )}
      </AnimatePresence>
      <div className="w-3 h-12 bg-pink-200 border-x border-pink-300" />
    </div>
  );
};

export default function App() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stage, setStage] = useState<'intro' | 'main' | 'wish'>('intro');
  const [candlesOut, setCandlesOut] = useState(0);
  const [giftOpened, setGiftOpened] = useState(false);
  const [showZombies, setShowZombies] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGiftClick = () => {
    if (!giftOpened) {
      setGiftOpened(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7f1d1d', '#000000', '#450a0a']
      });
      setTimeout(() => setShowZombies(true), 1000);
    }
  };

  const handleCandleBlow = () => {
    setCandlesOut(prev => {
      const next = prev + 1;
      if (next === 3) {
        setTimeout(() => setStage('wish'), 1000);
      }
      return next;
    });
  };

  if (stage === 'intro') {
    return (
      <div className="min-h-screen bg-black flex flex-center items-center justify-center text-white font-serif overflow-hidden">
        <Fog />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center z-20 space-y-8"
        >
          <motion.h2 
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl tracking-[0.3em] uppercase opacity-60"
          >
            Think of your birthday...
          </motion.h2>
          <motion.button
            whileHover={{ scale: 1.05, letterSpacing: '0.2em' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setStage('main')}
            className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-all text-lg tracking-widest"
          >
            WE KNEW IT... ENTER
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-serif selection:bg-red-900 overflow-hidden relative">
      <Fog />
      
      {/* Background Elements */}
      <div className="fixed top-10 left-10 opacity-20 z-0">
        <Moon className="w-32 h-32 text-gray-200 blur-[1px] shadow-[0_0_50px_rgba(255,255,255,0.2)]" />
      </div>

      <Spider />

      {showZombies && (
        <>
          <Zombie delay={0} />
          <Zombie delay={2} />
          <Zombie delay={5} />
        </>
      )}

      {/* Main Content */}
      <main className="relative z-20 container mx-auto px-4 py-20 flex flex-col items-center min-h-screen justify-between">
        
        {/* Header Section */}
        <div className="text-center space-y-12">
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center gap-8 mb-8"
          >
            <EyeFollower mousePos={mousePos} />
            <EyeFollower mousePos={mousePos} />
          </motion.div>

          <AnimatePresence mode="wait">
            {stage === 'main' ? (
              <motion.div
                key="main-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <BloodDrip text="HAPPY BIRTHDAY" />
                <p className="text-gray-500 italic text-xl">Even ghosts came tonight... to wish you.</p>
              </motion.div>
            ) : (
              <motion.div
                key="wish-text"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-4"
              >
                <h2 className="text-5xl text-emerald-500 font-bold drop-shadow-glow">WISH GRANTED</h2>
                <p className="text-gray-400 text-xl">Another year survived... so far.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive Centerpiece */}
        <div className="flex flex-col items-center gap-16 py-12">
          
          {/* The Cake */}
          <div className="relative group">
            <div className="flex gap-4 justify-center mb-2">
              <Candle onBlow={handleCandleBlow} />
              <Candle onBlow={handleCandleBlow} />
              <Candle onBlow={handleCandleBlow} />
            </div>
            <div className="w-48 h-24 bg-stone-800 rounded-t-3xl border-t-4 border-stone-700 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-4 bg-stone-900/50" />
              <div className="absolute bottom-2 left-4 right-4 h-2 bg-red-900/30 rounded-full" />
            </div>
            <div className="w-56 h-4 bg-stone-900 rounded-full -mt-1 shadow-xl" />
            <p className="text-center text-xs text-gray-600 mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Click to blow out candles
            </p>
          </div>

          {/* The Gift Box */}
          <motion.div
            animate={!giftOpened ? {
              rotate: [0, -2, 2, -2, 2, 0],
              scale: [1, 1.02, 1]
            } : { scale: 1.1 }}
            transition={{ duration: 0.5, repeat: !giftOpened ? Infinity : 0, repeatDelay: 2 }}
            onClick={handleGiftClick}
            className={`cursor-pointer relative p-8 rounded-2xl border-2 transition-all duration-500 ${
              giftOpened ? 'bg-red-950/20 border-red-900' : 'bg-stone-900 border-stone-800 hover:border-red-900'
            }`}
          >
            <AnimatePresence mode="wait">
              {!giftOpened ? (
                <motion.div key="closed" exit={{ scale: 0, opacity: 0 }}>
                  <Gift className="w-20 h-20 text-red-700" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="text-center"
                >
                  <Ghost className="w-20 h-20 text-gray-400 mx-auto mb-2" />
                  <span className="text-xs text-red-500 font-bold tracking-tighter">SURPRISE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Footer / Graveyard */}
        <div className="w-full flex justify-center gap-12 opacity-40 hover:opacity-100 transition-opacity pb-10">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex flex-col items-center group cursor-help">
              <div className="w-16 h-20 bg-stone-800 rounded-t-2xl border-t-2 border-stone-700 flex items-center justify-center relative overflow-hidden">
                <span className="text-[10px] text-stone-600 font-bold">RIP</span>
                <motion.div 
                  initial={{ y: 20 }}
                  whileHover={{ y: 0 }}
                  className="absolute inset-0 bg-red-900/20 flex items-center justify-center"
                >
                  <Skull className="w-6 h-6 text-red-900" />
                </motion.div>
              </div>
              <div className="w-20 h-2 bg-stone-900 rounded-full -mt-1" />
            </div>
          ))}
        </div>
      </main>

      {/* Bats */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ x: -100, y: Math.random() * 100 + '%' }}
            animate={{ 
              x: '110vw',
              y: [Math.random() * 100 + '%', Math.random() * 100 + '%', Math.random() * 100 + '%']
            }}
            transition={{ 
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: i * 3
            }}
            className="absolute"
          >
            <Zap className="w-6 h-6 text-stone-800 rotate-90 fill-current" />
          </motion.div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes drip {
          0% { height: 0; }
          100% { height: 50px; }
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
        }
      `}} />
    </div>
  );
}
