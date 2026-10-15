'use client'

import { useId, useSyncExternalStore } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { useI18n } from '@/components/providers/language-provider'

export const INFO_PANEL_STORAGE_KEY = 'nonSyncedKeys.infoPanelOpen'

const listeners = new Set<() => void>()
// Fallback when the browser storage is not available, the choice then lasts until the page is reloaded
let inMemoryOpen: boolean | null = null

function readOpen(): boolean {
  try {
    const value = window.localStorage.getItem(INFO_PANEL_STORAGE_KEY)
    // Open by default, so first time users see the instructions
    return value === null ? true : value === 'true'
  } catch {
    return inMemoryOpen ?? true
  }
}

function writeOpen(open: boolean) {
  try {
    window.localStorage.setItem(INFO_PANEL_STORAGE_KEY, String(open))
  } catch {
    inMemoryOpen = open
  }
  listeners.forEach(listener => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

// The panel is rendered open on the server, the stored choice is applied in the browser
function getServerSnapshot(): boolean {
  return true
}

export function InfoPanel() {
  const { t } = useI18n()
  const contentId = useId()
  const open = useSyncExternalStore(subscribe, readOpen, getServerSnapshot)

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 text-blue-950">
      <button
        type="button"
        onClick={() => writeOpen(!open)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-center gap-2 p-4 text-left font-medium"
      >
        <Info className="h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
        <span className="flex-1">{t.infoPanel.title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
      {open && (
        <ul
          id={contentId}
          className="list-disc list-outside space-y-2 px-4 pb-4 pl-11 text-sm"
        >
          {t.infoPanel.items.map(item => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
