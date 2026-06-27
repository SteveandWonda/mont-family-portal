import { type ReactNode } from 'react'

interface WidgetProps {
  title: string
  icon: ReactNode
  action?: { label: string; href: string }
  children: ReactNode
  className?: string
}

export default function Widget({ title, icon, action, children, className = '' }: WidgetProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="text-brand-500">{icon}</span>
          <h2 className="font-medium text-sm text-slate-200">{title}</h2>
        </div>
        {action && (
          <a
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {action.label} →
          </a>
        )}
      </div>
      <div className="flex-1 p-5">{children}</div>
    </div>
  )
}
