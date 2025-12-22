import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadSceneConfig, getDefaultConfig } from './loader'
import { DEFAULT_SCENE_CONFIG } from './defaults'

describe('loader', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.restoreAllMocks()
  })

  describe('getDefaultConfig', () => {
    it('returns default config', () => {
      const config = getDefaultConfig()
      expect(config).toEqual(DEFAULT_SCENE_CONFIG)
    })
  })

  describe('loadSceneConfig', () => {
    it('returns default config when fetch fails', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const config = await loadSceneConfig()

      expect(config).toEqual(DEFAULT_SCENE_CONFIG)
      expect(console.warn).toHaveBeenCalled()
    })

    it('returns default config when response is not ok', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      })

      const config = await loadSceneConfig()

      expect(config).toEqual(DEFAULT_SCENE_CONFIG)
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('404')
      )
    })

    it('merges partial config with defaults', async () => {
      const partialConfig = {
        background: '#ff0000',
        camera: {
          fov: 90,
        },
      }
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialConfig),
      })

      const config = await loadSceneConfig()

      expect(config.background).toBe('#ff0000')
      expect(config.camera.fov).toBe(90)
      expect(config.camera.near).toBe(DEFAULT_SCENE_CONFIG.camera.near)
      expect(config.camera.far).toBe(DEFAULT_SCENE_CONFIG.camera.far)
      expect(config.camera.position).toEqual(
        DEFAULT_SCENE_CONFIG.camera.position
      )
    })

    it('uses default lights when not specified', async () => {
      const partialConfig = {
        background: '#333333',
      }
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialConfig),
      })

      const config = await loadSceneConfig()

      expect(config.lights).toEqual(DEFAULT_SCENE_CONFIG.lights)
    })

    it('merges ambient light config', async () => {
      const partialConfig = {
        lights: {
          ambient: {
            intensity: 0.8,
          },
        },
      }
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialConfig),
      })

      const config = await loadSceneConfig()

      expect(config.lights.ambient.intensity).toBe(0.8)
      expect(config.lights.ambient.color).toBe(
        DEFAULT_SCENE_CONFIG.lights.ambient.color
      )
    })

    it('merges directional light array', async () => {
      const partialConfig = {
        lights: {
          directional: [
            { color: '#ff0000', intensity: 2 },
            { color: '#00ff00' },
          ],
        },
      }
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialConfig),
      })

      const config = await loadSceneConfig()

      expect(config.lights.directional).toHaveLength(2)
      expect(config.lights.directional[0].color).toBe('#ff0000')
      expect(config.lights.directional[0].intensity).toBe(2)
      expect(config.lights.directional[0].position).toEqual(
        DEFAULT_SCENE_CONFIG.lights.directional[0].position
      )
      expect(config.lights.directional[1].color).toBe('#00ff00')
    })

    it('merges controls config', async () => {
      const partialConfig = {
        controls: {
          dampingFactor: 0.5,
        },
      }
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(partialConfig),
      })

      const config = await loadSceneConfig()

      expect(config.controls.dampingFactor).toBe(0.5)
      expect(config.controls.enableDamping).toBe(
        DEFAULT_SCENE_CONFIG.controls.enableDamping
      )
    })
  })
})
