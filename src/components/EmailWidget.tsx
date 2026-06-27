import { Mail, ExternalLink } from 'lucide-react'
import Widget from './Widget'

export default function EmailWidget() {
  return (
    <Widget
      title="Email"
      icon={<Mail size={16} />}
      action={{ label: 'Open Fastmail', href: 'https://app.fastmail.com' }}
    >
      <div className="flex flex-col items-center justify-center py-6 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Mail size={22} className="text-brand-500" />
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">johno@mont.family</p>
          <p className="text-xs text-slate-500 mt-1">Powered by Fastmail</p>
        </div>
        <a
          href="https://app.fastmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Open Inbox
          <ExternalLink size={13} />
        </a>
      </div>
    </Widget>
  )
}
