import { Link } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { Flag, Menu, Moon, Sun, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import ClerkHeader from '../integrations/clerk/header-user.tsx'

const navLinks: Array<{ to: string; label: string; exact?: boolean }> = [
  { to: '/', label: 'Home', exact: true },
  { to: '/races', label: 'Races' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/my-predictions', label: 'My Picks' },
]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Header({
  mobileMenuOpen,
  onMobileMenuOpenChange,
  themeKey = 'grand-prix-picks-theme',
}: {
  mobileMenuOpen: boolean
  onMobileMenuOpenChange: (open: boolean) => void
  themeKey?: string
}) {
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  // Initialize to false so SSR and first client render match (no localStorage on server).
  // Sync from localStorage after mount to avoid hydration mismatch.
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const syncTheme = () => {
      const saved = localStorage.getItem(themeKey)
      const isDark =
        saved === 'dark'
          ? true
          : saved === 'light'
            ? false
            : window.matchMedia('(prefers-color-scheme: dark)').matches
      setDark(isDark)
    }
    syncTheme()
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', syncTheme)
    return () => mq.removeEventListener('change', syncTheme)
  }, [themeKey])

  const toggleTheme = useCallback(() => {
    const next = document.documentElement.classList.toggle('dark')
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem(themeKey, next ? 'dark' : 'light')
    setDark(next)
  }, [themeKey])

  // Lock body scroll when mobile menu is open (mobile only)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    if (mobileMenuOpen && mq.matches) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Focus trap: cycle Tab only within header + menu when menu is open (mobile only)
  useEffect(() => {
    if (!mobileMenuOpen || !headerRef.current) {
      return
    }

    const mq = window.matchMedia('(max-width: 640px)')
    if (!mq.matches) return

    const headerEl = headerRef.current

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onMobileMenuOpenChange(false)
        menuButtonRef.current?.focus()
        return
      }

      if (e.key !== 'Tab' || !headerEl) {
        return
      }

      const allFocusable = Array.from(
        headerEl.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((el) => !el.hasAttribute('inert') && el.offsetParent !== null)

      if (allFocusable.length === 0) return

      const currentIndex = allFocusable.indexOf(
        document.activeElement as HTMLElement,
      )

      const isLeavingTrap =
        currentIndex === -1 ||
        (e.shiftKey && currentIndex === 0) ||
        (!e.shiftKey && currentIndex === allFocusable.length - 1)

      if (isLeavingTrap) {
        e.preventDefault()
        const nextIndex = e.shiftKey ? allFocusable.length - 1 : 0
        allFocusable[nextIndex]?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen, onMobileMenuOpenChange])

  // Focus first link when menu opens
  useEffect(() => {
    if (mobileMenuOpen && menuRef.current) {
      const firstLink = menuRef.current.querySelector<HTMLElement>('a')
      firstLink?.focus()
    }
  }, [mobileMenuOpen])

  const closeMenu = useCallback(() => {
    onMobileMenuOpenChange(false)
    menuButtonRef.current?.focus()
  }, [onMobileMenuOpenChange])

  return (
    <header
      ref={headerRef}
      className="relative sticky top-0 z-50 border-b border-border bg-surface text-text shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Flag className="h-6 w-6 text-accent" />
            <span className="pr-1 text-xl font-bold tracking-tight">
              Grand Prix Picks
            </span>
          </Link>

          {/* Desktop nav - accent link style, thick border for selected, full-area hover highlight */}
          <nav className="hidden items-center gap-1 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg border-2 border-transparent px-3 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent-muted/50 hover:text-accent-hover"
                activeProps={{
                  className:
                    'px-3 py-2 rounded-lg text-accent border-2 nav-link-active transition-colors text-sm font-semibold',
                }}
                activeOptions={link.exact ? { exact: true } : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-lg p-2 text-accent transition-colors hover:text-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <ClerkHeader />

          {/* Mobile menu button */}
          <motion.button
            ref={menuButtonRef}
            onClick={() => onMobileMenuOpenChange(!mobileMenuOpen)}
            className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-surface-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 sm:hidden"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav"
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X size={24} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={24} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile nav - positioned absolute to overlay content */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 top-[57px] z-40 sm:hidden"
              style={{ backgroundColor: 'var(--overlay)' }}
              onClick={closeMenu}
            />
            {/* Menu */}
            <motion.nav
              ref={menuRef}
              id="mobile-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-[calc(100%-7px)] right-0 left-0 z-50 border-b border-border bg-surface shadow-xl sm:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <Link
                      to={link.to}
                      onClick={closeMenu}
                      className="block rounded-lg border-2 border-transparent px-3 py-2 font-semibold text-accent transition-colors hover:bg-accent-muted/50 hover:text-accent-hover"
                      activeProps={{
                        className:
                          'block px-3 py-2 rounded-lg text-accent border-2 nav-link-active font-semibold transition-colors',
                      }}
                      activeOptions={link.exact ? { exact: true } : undefined}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
