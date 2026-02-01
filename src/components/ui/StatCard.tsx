import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'indigo' | 'red'
  trend?: string
  description?: string
  className?: string
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue',
  trend, 
  description,
  className 
}: StatCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    indigo: 'from-indigo-500 to-indigo-600',
    red: 'from-red-500 to-red-600'
  }

  return (
    <motion.div
      className={cn(
        "bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="text-xs text-gray-500 mt-1">{trend}</p>
          )}
          {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
          )}
        </div>
        <motion.div 
          className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} text-white shadow-lg`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.2 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}
