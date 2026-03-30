import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'pulse' | 'bounce' | 'rotate' | 'dots' | 'morph' | 'skeleton'
  color?: 'primary' | 'secondary' | 'accent' | 'neutral'
  className?: string
  text?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'pulse',
  color = 'primary',
  className,
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const colorSchemes = {
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-cyan-500 to-blue-500',
    accent: 'from-purple-500 to-pink-500',
    neutral: 'from-gray-400 to-gray-600'
  }

  const variants = {
    pulse: (
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-r',
          colorSchemes[color],
          sizeClasses[size],
          className
        )}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ),

    bounce: (
      <div className={cn('flex space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full bg-gradient-to-r',
              colorSchemes[color],
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            )}
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    ),

    rotate: (
      <motion.div
        className={cn(
          'rounded-full border-2 border-transparent border-t-current',
          sizeClasses[size],
          className
        )}
        style={{
          background: `linear-gradient(45deg, transparent 30%, currentColor 50%, transparent 70%)`,
          color: color === 'primary' ? '#3B82F6' : color === 'secondary' ? '#06B6D4' : color === 'accent' ? '#A855F7' : '#6B7280'
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    ),

    dots: (
      <div className={cn('flex items-center justify-center', className)}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={cn(
              'rounded-full',
              color === 'primary' ? 'bg-blue-500' : color === 'secondary' ? 'bg-cyan-500' : color === 'accent' ? 'bg-purple-500' : 'bg-gray-500',
              size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-2 h-2' : size === 'lg' ? 'w-3 h-3' : 'w-4 h-4'
            )}
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
        className={cn(
          'bg-gradient-to-r',
          colorSchemes[color],
          sizeClasses[size],
          className
        )}
        animate={{
          borderRadius: ['20%', '50%', '20%', '50%'],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    ),

    skeleton: (
      <div className={cn('space-y-2', className)}>
        <motion.div
          className={cn(
            'rounded',
            color === 'primary' ? 'bg-blue-200' : color === 'secondary' ? 'bg-cyan-200' : color === 'accent' ? 'bg-purple-200' : 'bg-gray-200',
            size === 'sm' ? 'h-2 w-8' : size === 'md' ? 'h-3 w-12' : size === 'lg' ? 'h-4 w-16' : 'h-6 w-20'
          )}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className={cn(
            'rounded',
            color === 'primary' ? 'bg-blue-200' : color === 'secondary' ? 'bg-cyan-200' : color === 'accent' ? 'bg-purple-200' : 'bg-gray-200',
            size === 'sm' ? 'h-2 w-6' : size === 'md' ? 'h-3 w-10' : size === 'lg' ? 'h-4 w-14' : 'h-6 w-18'
          )}
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: 0.3,
            ease: "easeInOut"
          }}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-3">
      {variants[variant]}
      {text && (
        <motion.p
          className={cn(
            'text-sm font-medium',
            color === 'primary' ? 'text-blue-600' : color === 'secondary' ? 'text-cyan-600' : color === 'accent' ? 'text-purple-600' : 'text-gray-600'
          )}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, 30, 0],
              y: [0, -30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="text-center relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo with modern animation */}
        <motion.div
          className="relative mx-auto mb-8"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-xl opacity-30"></div>
          <img 
            src="/logo.png" 
            alt="VoteChain Logo" 
            className="relative w-24 h-24 md:w-32 md:h-32 mx-auto rounded-2xl"
          />
        </motion.div>
        
        <div className="flex flex-col items-center space-y-6">
          {/* Modern loading spinner */}
          <LoadingSpinner size="xl" variant="morph" color="primary" />
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              SSC Voting System
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Initializing secure blockchain voting...
            </p>
          </motion.div>

          {/* Progress indicators */}
          <motion.div
            className="w-full max-w-xs space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="flex justify-between text-xs text-gray-500">
              <span>Loading</span>
              <span>Please wait</span>
            </div>
            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                animate={{ x: ['-100%', '0%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ width: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
