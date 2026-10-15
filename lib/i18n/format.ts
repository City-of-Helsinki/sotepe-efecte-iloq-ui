import type { Language } from './config'
import { getDictionary } from './dictionaries'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

// fi: "15.10.2026 klo 9.30", en: "October 15, 2026 at 09:30"
export function formatDateTime(date: Date, language: Language): string {
  const separator = getDictionary(language).common.dateTimeSeparator

  if (language === 'fi') {
    const datePart = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`
    return `${datePart} ${separator} ${date.getHours()}.${pad(date.getMinutes())}`
  }

  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return `${datePart} ${separator} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
