import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray' | 'purple' | 'gradient';
  text?: string;
  variant?: 'classic' | 'modern' | 'orbital' | 'pulsing' | 'dots' | 'morph';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue', 
  text,
  variant = 'modern'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorSchemes = {
    blue: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      tertiary: '#93C5FD',
      shadow: 'shadow-blue-500/25'
    },
    white: {
      primary: '#FFFFFF',
      secondary: '#E5E7EB',
      tertiary: '#9CA3AF',
      shadow: 'shadow-white/25'
    },
    gray: {
      primary: '#4B5563',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      shadow: 'shadow-gray-500/25'
    },
    purple: {
      primary: '#8B5CF6',
      secondary: '#A78BFA',
      tertiary: '#C4B5FD',
      shadow: 'shadow-purple-500/25'
    },
    gradient: {
      primary: '#3B82F6',
      secondary: '#8B5CF6',
      tertiary: '#EC4899',
      shadow: 'shadow-blue-500/25'
    }
  };

  const variants = {
    classic: (
      <motion.div
        className={`
          ${sizeClasses[size]} 
          border-4 rounded-full
          border-gray-200 
          border-t-2
          ${colorSchemes[color].shadow} shadow-lg
          transform-gpu
        `}
        style={{ borderTopColor: colorSchemes[color].primary }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ),
    
    modern: (
      <div className="relative">
        {/* Outer glow effect */}
        <motion.div
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 rounded-full 
            ${colorSchemes[color].shadow} 
            blur-sm
          `}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Main spinner with gradient */}
        <motion.div
          className={`
            ${sizeClasses[size]} 
            rounded-full
            ${color === 'gradient' 
              ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' 
              : ''
            }
            ${color !== 'gradient' ? '' : 'shadow-xl'}
            transform-gpu
          `}
          style={color !== 'gradient' ? {
            background: `conic-gradient(from 0deg, ${colorSchemes[color].primary}, ${colorSchemes[color].secondary}, ${colorSchemes[color].primary})`,
            WebkitMask: 'radial-gradient(circle, transparent 35%, black 35%)',
            mask: 'radial-gradient(circle, transparent 35%, black 35%)'
          } : {}}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
    ),
    
    orbital: (
      <div className="relative">
        {/* Orbital rings */}
        <motion.div
          className={`
            ${sizeClasses[size]} 
            border-2 rounded-full border-dashed
            transform-gpu
          `}
          style={{ borderColor: `${colorSchemes[color].primary}30` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 border-2 rounded-full border-dashed
            transform-gpu
          `}
          style={{ borderColor: `${colorSchemes[color].secondary}50` }}
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Central sphere */}
        <motion.div
          className={`
            absolute top-1/2 left-1/2 w-1/2 h-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full
            ${colorSchemes[color].shadow} shadow-lg
            transform-gpu
          `}
          style={{
            background: `linear-gradient(135deg, ${colorSchemes[color].primary}, ${colorSchemes[color].secondary})`
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    ),
    
    pulsing: (
      <div className="relative">
        {/* Pulsing spheres */}
        <motion.div
          className={`
            ${sizeClasses[size]} 
            rounded-full
            ${colorSchemes[color].shadow} shadow-2xl
            transform-gpu
          `}
          style={{
            background: `linear-gradient(135deg, ${colorSchemes[color].primary}, ${colorSchemes[color].secondary})`
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Outer pulse ring */}
        <motion.div
          className={`
            absolute inset-0 rounded-full border-2
            transform-gpu
          `}
          style={{ borderColor: `${colorSchemes[color].primary}50` }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
    ),

    dots: (
      <div className="flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`
              rounded-full
              ${size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'}
              ${i > 0 ? 'ml-1' : ''}
            `}
            style={{ backgroundColor: colorSchemes[color].primary }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    ),

    morph: (
      <motion.div
        className={`
          ${sizeClasses[size]}
          ${colorSchemes[color].shadow} shadow-lg
          transform-gpu
        `}
        style={{
          background: `linear-gradient(135deg, ${colorSchemes[color].primary}, ${colorSchemes[color].secondary})`
        }}
        animate={{
          borderRadius: ['20%', '50%', '20%', '50%'],
          rotate: [0, 180, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    )
  };

  const textColor = color === 'white' ? 'text-white' : 
                   color === 'gray' ? 'text-gray-600' : 
                   color === 'purple' ? 'text-purple-600' :
                   color === 'gradient' ? 'text-blue-600' :
                   'text-blue-600';

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="transform-gpu transition-all duration-300 hover:scale-105">
        {variants[variant]}
      </div>
      
      {text && (
        <div className="text-center">
          <motion.p 
            className={`text-sm font-medium ${textColor}`}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            {text}
          </motion.p>
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-1">
            {[0, 1, 2].map((dot) => (
              <motion.div
                key={dot}
                className={`
                  w-1 h-1 rounded-full
                `}
                style={{ backgroundColor: colorSchemes[color].primary }}
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: dot * 0.1,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};