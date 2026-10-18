'use client'

import { useState } from 'react'

interface HyperlinkButtonProps {
  targetId: string
  currentValue: string
  onInsert: (newValue: string) => void
  className?: string
}

/**
 * HyperlinkButton — inserts an <a href="...">text</a> at the cursor position
 * in a textarea or input referenced by targetId.
 */
export default function HyperlinkButton({ targetId, currentValue, onInsert, className }: HyperlinkButtonProps) {
  const [showPopup, setShowPopup] = useState(false)
  const [linkText, setLinkText] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  const handleInsert = () => {
    const el = document.getElementById(targetId) as HTMLInputElement | HTMLTextAreaElement | null
    if (!el) { setShowPopup(false); return }
    const start = el.selectionStart ?? currentValue.length
    const end = el.selectionEnd ?? currentValue.length
    const selected = currentValue.slice(start, end)
    const text = linkText || selected || 'link'
    const tag = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`
    const newVal = currentValue.slice(0, start) + tag + currentValue.slice(end)
    onInsert(newVal)
    setShowPopup(false)
    setLinkText('')
    setLinkUrl('')
  }

  return (
    <div className={`relative inline-block ${className ?? ''}`}>
      <button
        type="button"
        title="Insert Hyperlink"
        onClick={() => setShowPopup((v) => !v)}
        className="p-1 text-gray-400 hover:text-[--color-navy] hover:bg-[--color-pale-blue] border border-gray-200 transition-colors"
        aria-label="Insert hyperlink"
      >
        {/* Link icon */}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
          <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
        </svg>
      </button>

      {showPopup && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 shadow-lg p-3 w-64 space-y-2">
          <p className="text-xs font-semibold text-gray-600">Insert Hyperlink</p>
          <input
            type="text"
            className="form-input text-sm"
            placeholder="Link text (optional if text is selected)"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
          />
          <input
            type="url"
            className="form-input text-sm"
            placeholder="https://..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleInsert() }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleInsert}
              disabled={!linkUrl}
              className="btn-primary !py-1 !px-3 text-xs flex-1 disabled:opacity-50"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="btn-secondary !py-1 !px-3 text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
