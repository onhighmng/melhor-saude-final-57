/**
 * Brand Configuration for Loading Animation
 * 
 * This file centralizes all branding assets and colors for the loading animation.
 * Update these values to customize the loading experience across your app.
 */

import logoWordmark from "@/assets/35455f539b96cad8ef1d386a642da71621949352.png";
import logoMascot from "@/assets/dca1667b7a13b537085ad45b6ab92b57b127771e.png";

export const loadingAnimationConfig = {
  // Brand Assets
  mascot: logoMascot,
  wordmark: logoWordmark,

  // Brand Colors
  primaryColor: "#1877F2", // Melhor Saúde Blue
  glowColor: "#1877F2",    // Color for glow effects (defaults to primaryColor if not set)
  textColor: "#1E3A8A",    // Dark Blue for text
  backgroundColor: undefined, // Use undefined for default gradient, or specify a custom color

  // Default Messages (Portuguese)
  messages: {
    default: "Carregando...",
    defaultSub: "Estamos preparando a sua experiência.",
    sessionBooking: "Agendando sessão...",
    sessionBookingSub: "Preparando sua próxima sessão de bem-estar",
    loadingResources: "Carregando recursos...",
    loadingResourcesSub: "Preparando suas sessões de bem-estar",
  },
};

// Preset configurations for different contexts
export const loadingPresets = {
  appLaunch: {
    variant: "fullscreen" as const,
    message: loadingAnimationConfig.messages.default,
    submessage: loadingAnimationConfig.messages.defaultSub,
    showProgress: true,
  },
  
  sessionBooking: {
    variant: "modal" as const,
    message: loadingAnimationConfig.messages.sessionBooking,
    submessage: loadingAnimationConfig.messages.sessionBookingSub,
    showProgress: true,
  },
  
  resourceLoading: {
    variant: "inline" as const,
    message: loadingAnimationConfig.messages.loadingResources,
    submessage: loadingAnimationConfig.messages.loadingResourcesSub,
    showProgress: false,
  },
};
