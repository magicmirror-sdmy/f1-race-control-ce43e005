 import { useCallback } from "react";
 
 export const useGameFeedback = () => {
   const triggerHaptic = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
     if ('vibrate' in navigator) {
       const duration = intensity === 'light' ? 25 : intensity === 'medium' ? 50 : 100;
       navigator.vibrate(duration);
     }
   }, []);
 
   const playSound = useCallback((sound: 'brake' | 'throttle' | 'emergency' | 'click') => {
     // Placeholder for sound effects - can be implemented with Web Audio API
     console.log(`[Sound] ${sound}`);
   }, []);
 
   return { triggerHaptic, playSound };
 };