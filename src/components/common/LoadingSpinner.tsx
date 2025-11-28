import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'white' | 'gray' | 'purple' | 'gradient';
  text?: string;
  variant?: 'classic' | 'modern' | 'orbital' | 'pulsing';
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
      primary: 'border-t-blue-500',
      secondary: 'border-r-blue-400',
      tertiary: 'border-b-blue-300',
      shadow: 'shadow-blue-500/25'
    },
    white: {
      primary: 'border-t-white',
      secondary: 'border-r-gray-300',
      tertiary: 'border-b-gray-400',
      shadow: 'shadow-white/25'
    },
    gray: {
      primary: 'border-t-gray-600',
      secondary: 'border-r-gray-500',
      tertiary: 'border-b-gray-400',
      shadow: 'shadow-gray-500/25'
    },
    purple: {
      primary: 'border-t-purple-500',
      secondary: 'border-r-purple-400',
      tertiary: 'border-b-purple-300',
      shadow: 'shadow-purple-500/25'
    },
    gradient: {
      primary: 'border-t-blue-500',
      secondary: 'border-r-purple-500',
      tertiary: 'border-b-pink-500',
      shadow: 'shadow-blue-500/25'
    }
  };

  const variants = {
    classic: (
      <div
        className={`
          ${sizeClasses[size]} 
          border-4 rounded-full animate-spin
          border-gray-200 
          ${colorSchemes[color].primary}
          ${colorSchemes[color].shadow} shadow-lg
          transform-gpu
        `}
      />
    ),
    
    modern: (
      <div className="relative">
        {/* Outer glow effect */}
        <div
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 rounded-full 
            ${colorSchemes[color].shadow} 
            blur-sm animate-pulse
          `}
        />
        {/* Main spinner with gradient borders */}
        <div
          className={`
            ${sizeClasses[size]} 
            border-4 rounded-full animate-spin
            border-transparent
            bg-gradient-to-r from-transparent via-transparent to-transparent
            [border-image:conic-gradient(from_0deg,transparent,var(--tw-gradient-from),var(--tw-gradient-to),transparent)_1]
            ${color === 'gradient' 
              ? 'from-blue-500 via-purple-500 to-pink-500' 
              : `from-${colorSchemes[color].primary.split('-')[1]}-400 to-${colorSchemes[color].primary.split('-')[1]}-600`
            }
            ${colorSchemes[color].shadow} shadow-xl
            transform-gpu transition-all duration-300
            hover:scale-110 hover:shadow-2xl
          `}
          style={{
            borderImageSlice: 1,
          }}
        />
        {/* Inner shadow for depth */}
        <div
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 rounded-full 
            border-2 border-white/10
            transform-gpu
          `}
        />
      </div>
    ),
    
    orbital: (
      <div className="relative">
        {/* Orbital rings */}
        <div
          className={`
            ${sizeClasses[size]} 
            border-2 rounded-full animate-spin
            border-dashed ${colorSchemes[color].primary}/30
            transform-gpu
          `}
          style={{ animationDuration: '3s' }}
        />
        <div
          className={`
            ${sizeClasses[size]} 
            absolute inset-0 border-2 rounded-full animate-spin
            border-dashed ${colorSchemes[color].secondary}/50
            transform-gpu
          `}
          style={{ animationDuration: '2s', animationDirection: 'reverse' }}
        />
        {/* Central sphere */}
        <div
          className={`
            absolute inset-1/4 w-1/2 h-1/2 rounded-full
            bg-gradient-to-br ${colorSchemes[color].primary} ${colorSchemes[color].secondary}
            ${colorSchemes[color].shadow} shadow-lg
            animate-pulse
            transform-gpu
          `}
        />
      </div>
    ),
    
    pulsing: (
      <div className="relative">
        {/* Pulsing spheres */}
        <div
          className={`
            ${sizeClasses[size]} 
            rounded-full animate-spin
            bg-gradient-to-br ${colorSchemes[color].primary} ${colorSchemes[color].secondary}
            ${colorSchemes[color].shadow} shadow-2xl
            transform-gpu
            before:content-[''] before:absolute before:inset-2
            before:rounded-full before:bg-white/20
            after:content-[''] after:absolute after:inset-4
            after:rounded-full after:bg-white/10
          `}
          style={{ animationDuration: '1.5s' }}
        />
        {/* Outer pulse ring */}
        <div
          className={`
            absolute inset-0 rounded-full
            border-2 ${colorSchemes[color].primary}/30
            animate-ping
            transform-gpu
          `}
          style={{ animationDuration: '2s' }}
        />
      </div>
    )
  };

  const textColor = color === 'white' ? 'text-white' : 
                   color === 'gray' ? 'text-gray-600' : 
                   `text-${colorSchemes[color].primary.split('-')[1]}-600`;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-4">
      <div className="transform-gpu transition-all duration-300 hover:scale-105">
        {variants[variant]}
      </div>
      
      {text && (
        <div className="text-center">
          <p className={`text-sm font-medium ${textColor} animate-pulse`}>
            {text}
          </p>
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-1 mt-1">
            {[0, 1, 2].map((dot) => (
              <div
                key={dot}
                className={`
                  w-1 h-1 rounded-full
                  ${color === 'white' ? 'bg-white' : `bg-${colorSchemes[color].primary.split('-')[1]}-500`}
                  animate-bounce
                `}
                style={{ animationDelay: `${dot * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};