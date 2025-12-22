import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useSceneConfig } from './useSceneConfig'
import { DEFAULT_SCENE_CONFIG } from '../config/defaults'

describe('useSceneConfig', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  it('returns default config initially', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useSceneConfig())

    expect(result.current.config).toEqual(DEFAULT_SCENE_CONFIG)
  })

  it('starts with isLoading true', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useSceneConfig())

    expect(result.current.isLoading).toBe(true)
  })

  it('sets isLoading to false after loading', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useSceneConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('loads config from fetch', async () => {
    const customConfig = {
      background: '#ff0000',
      camera: { fov: 90 },
    }
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(customConfig),
    })

    const { result } = renderHook(() => useSceneConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.config.background).toBe('#ff0000')
    expect(result.current.config.camera.fov).toBe(90)
  })

  it('returns default config when fetch fails', async () => {
    // Note: loadSceneConfig catches errors internally and returns defaults
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useSceneConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // loadSceneConfig handles errors internally, so hook receives default config
    expect(result.current.config).toEqual(DEFAULT_SCENE_CONFIG)
  })

  it('reloads config when reload is called', async () => {
    let callCount = 0
    globalThis.fetch = vi.fn().mockImplementation(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            background: callCount === 1 ? '#111111' : '#222222',
          }),
      })
    })

    const { result } = renderHook(() => useSceneConfig())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
    expect(result.current.config.background).toBe('#111111')

    act(() => {
      result.current.reload()
    })

    await waitFor(() => {
      expect(result.current.config.background).toBe('#222222')
    })
  })

  it('has no error initially', () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    const { result } = renderHook(() => useSceneConfig())

    expect(result.current.error).toBeNull()
  })
})
