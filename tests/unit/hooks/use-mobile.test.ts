import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useIsMobile } from '@/hooks/use-mobile'

describe('useIsMobile', () => {
  beforeEach(() => {
    // Reset window.innerWidth and matchMedia mock
    vi.stubGlobal('innerWidth', 1024)
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  })

  it('should return false when window width is greater than the mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 1024)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('should return true when window width is less than the mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 500)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('should update value when window is resized', () => {
    let changeHandler: () => void = () => {}
    
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      addEventListener: (_type: string, handler: () => void) => {
        changeHandler = handler
      },
      removeEventListener: vi.fn(),
    })))

    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    // Simulate resize
    act(() => {
      vi.stubGlobal('innerWidth', 500)
      changeHandler()
    })

    expect(result.current).toBe(true)
  })
})
