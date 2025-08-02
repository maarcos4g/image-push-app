import { ComponentProps, ElementRef, useRef } from "react"
import { useHotkeys } from "react-hotkeys-hook"

type MenuItemProps = ComponentProps<'button'> & {
  hotkey?: string
}

function getSymbolCombination(hotkey: string): string {
  const modifierMap: Record<string, string> = {
    shift: '⇧',
    ctrl: 'Ctrl',
    alt: '⌥',
    meta: '⌘',
    mod: isMacOs() ? '⌘' : 'Ctrl',
  }

  const keys = hotkey.split('+')

  const symbolModifiers = keys.map(key => {
    return key in modifierMap ? modifierMap[key] : key.toUpperCase()
  }).join('+')

  return symbolModifiers
}

function isMacOs() {
  return navigator.userAgent.toUpperCase().includes('MAC')
}

export function MenuItem({ hotkey = '', children, className, ...props }: MenuItemProps) {
  const buttonRef = useRef<ElementRef<'button'>>(null)

  useHotkeys(hotkey, () => {
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true
    })

    buttonRef.current?.dispatchEvent(clickEvent)
  }, {
    enabled: hotkey !== '',
    preventDefault: false
  })

  return (
    <button
      ref={buttonRef}
      className={`flex group px-2.5 py-1.5 cursor-default items-center rounded-sm gap-2 w-full enabled:hover:bg-violet-500 disabled:opacity-40 aria-pressed:bg-violet-400 ${className}`}
      {...props}
    >
      {children}

      {!!hotkey && (
        <kbd
          className="text-white/40 font-sans tabular-nums font-light tracking-[.2em] ml-auto group-hover:text-white"
        >
          {getSymbolCombination(hotkey)}
        </kbd>
      )}
    </button>
  )
}