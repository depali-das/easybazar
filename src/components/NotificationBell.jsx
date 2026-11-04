import { useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext.jsx'
import NotificationDropdown from './NotificationDropdown.jsx'

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState(null)
  const wrapperRef = useRef(null)
  const { unreadCount } = useNotifications()

  useEffect(() => {
    const closeOutside = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={(event) => {
          if (!isOpen && window.innerWidth < 768) {
            const bounds = event.currentTarget.getBoundingClientRect()
            setDropdownPosition({
              top: bounds.bottom + 8,
              right: Math.max(12, window.innerWidth - bounds.right),
            })
          }
          setIsOpen((open) => !open)
        }}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="header-action-button relative flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-green-50 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-green-100"
      >
        <Bell size={21} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-extrabold leading-none text-white" aria-hidden="true">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <NotificationDropdown
          onClose={() => setIsOpen(false)}
          mobilePosition={window.innerWidth < 768 ? dropdownPosition : null}
        />
      )}
    </div>
  )
}
