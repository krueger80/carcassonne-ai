import { motion } from 'framer-motion'

interface FairyPieceProps {
  size?: number
}

export function FairyPiece({ size = 24 }: FairyPieceProps) {
  return (
    <div style={{
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'none',
      filter: 'drop-shadow(0 0 8px rgba(241, 196, 15, 0.8))',
    }}>
      <motion.div
        animate={{ 
          y: [-2, 2, -2],
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 3,
          ease: "easeInOut"
        }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 24 24">
          {/* Outer glow aura */}
          <circle cx="12" cy="12" r="10" fill="url(#fairy-glow)" opacity="0.4">
            <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
          </circle>
          
          <defs>
            <radialGradient id="fairy-glow">
              <stop offset="0%" stopColor="#f1c40f" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Wings */}
          <path
            d="M12,12 Q18,4 22,10 Q18,14 12,12 Z"
            fill="#fff"
            opacity="0.6"
          >
             <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="10 12 12" dur="0.5s" repeatCount="indefinite" additive="sum" />
          </path>
          <path
            d="M12,12 Q6,4 2,10 Q6,14 12,12 Z"
            fill="#fff"
            opacity="0.6"
          >
             <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="-10 12 12" dur="0.5s" repeatCount="indefinite" additive="sum" />
          </path>

          {/* Core body */}
          <circle cx="12" cy="12" r="4" fill="#f1c40f" stroke="#fff" strokeWidth="1" />
          
          {/* Sparkles */}
          <circle cx="8" cy="8" r="1" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="16" cy="16" r="1" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" delay="0.3s" />
          </circle>
          <circle cx="16" cy="8" r="1" fill="#fff">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite" delay="0.6s" />
          </circle>
        </svg>
      </motion.div>
    </div>
  )
}
