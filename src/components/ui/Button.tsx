import { motion } from 'framer-motion'
import React from 'react'

interface ButtonProps {
    children: React.ReactNode
    onClick: () => void
    primary?: boolean
    danger?: boolean
    disabled?: boolean
    style?: React.CSSProperties
    title?: string
}

export function Button({ children, onClick, primary, danger, disabled, style, title }: ButtonProps) {
    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            onClick={(e) => {
                e.stopPropagation();
                if (!disabled) onClick()
            }}
            title={title}
            disabled={disabled}
            style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: disabled
                    ? '#333'
                    : primary
                        ? 'linear-gradient(135deg, #4a9a4a, #3a7a3a)'
                        : danger
                            ? 'linear-gradient(135deg, #9a4a4a, #7a3a3a)'
                            : '#444',
                color: disabled ? '#888' : 'white',
                fontWeight: 'bold',
                cursor: disabled ? 'not-allowed' : 'pointer',
                fontSize: 13,
                boxShadow: disabled ? 'none' : '0 4px 6px rgba(0,0,0,0.2)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: disabled ? 0.6 : 1,
                ...style
            }}
        >
            {children}
        </motion.button>
    )
}
