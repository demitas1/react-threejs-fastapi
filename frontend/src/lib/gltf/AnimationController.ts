import * as THREE from 'three'
import { AnimationInfo } from './types'

/**
 * Options for AnimationController
 */
export interface AnimationControllerOptions {
  fadeTime?: number // Default: 0.5
  autoPlay?: boolean // Default: true
}

/**
 * Animation Controller for managing Three.js animations
 * Separated from GLTFSceneLoader following Single Responsibility Principle
 */
export class AnimationController {
  private mixer: THREE.AnimationMixer | null = null
  private clips: THREE.AnimationClip[] = []
  private actions: Map<string, THREE.AnimationAction> = new Map()
  private currentAction: THREE.AnimationAction | null = null
  private currentIndex: number = 0
  private fadeTime: number

  constructor(
    model: THREE.Object3D,
    clips: THREE.AnimationClip[],
    options?: AnimationControllerOptions
  ) {
    this.fadeTime = options?.fadeTime ?? 0.5
    const autoPlay = options?.autoPlay ?? true

    if (clips.length === 0) {
      return
    }

    // Create AnimationMixer
    this.mixer = new THREE.AnimationMixer(model)
    this.clips = clips
    this.currentIndex = 0

    // Create actions for each animation
    for (const clip of clips) {
      const action = this.mixer.clipAction(clip)
      this.actions.set(clip.name, action)
    }

    // Auto-play first animation
    if (autoPlay && clips.length > 0) {
      this.play(clips[0].name)
    }
  }

  /**
   * Get animation information list
   */
  getAnimations(): AnimationInfo[] {
    return this.clips.map((clip) => ({
      name: clip.name,
      duration: clip.duration,
    }))
  }

  /**
   * Get current animation name
   */
  getCurrentAnimationName(): string | null {
    if (this.clips.length === 0) return null
    return this.clips[this.currentIndex].name
  }

  /**
   * Check if model has animations
   */
  hasAnimations(): boolean {
    return this.clips.length > 0
  }

  /**
   * Play animation by name with crossfade
   */
  play(name: string, fadeTime?: number): void {
    const newAction = this.actions.get(name)
    if (!newAction) return

    // Skip if same animation
    if (newAction === this.currentAction) return

    const actualFadeTime = fadeTime ?? this.fadeTime

    // Crossfade to new animation
    newAction.reset().setEffectiveWeight(1).play()
    if (this.currentAction) {
      this.currentAction.crossFadeTo(newAction, actualFadeTime, true)
    }
    this.currentAction = newAction

    // Update index
    const index = this.clips.findIndex((clip) => clip.name === name)
    if (index !== -1) {
      this.currentIndex = index
    }
  }

  /**
   * Play next animation in sequence (circular)
   */
  next(fadeTime?: number): string | null {
    if (this.clips.length === 0) return null

    this.currentIndex = (this.currentIndex + 1) % this.clips.length
    const nextClip = this.clips[this.currentIndex]
    this.play(nextClip.name, fadeTime)

    return nextClip.name
  }

  /**
   * Stop all animations
   */
  stop(): void {
    if (this.mixer) {
      this.mixer.stopAllAction()
    }
    this.currentAction = null
  }

  /**
   * Pause current animation
   */
  pause(): void {
    if (this.currentAction) {
      this.currentAction.paused = true
    }
  }

  /**
   * Resume current animation
   */
  resume(): void {
    if (this.currentAction) {
      this.currentAction.paused = false
    }
  }

  /**
   * Update animation mixer (call in animation loop)
   */
  update(delta: number): void {
    if (this.mixer) {
      this.mixer.update(delta)
    }
  }

  /**
   * Dispose all resources
   */
  dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer = null
    }
    this.clips = []
    this.actions.clear()
    this.currentAction = null
    this.currentIndex = 0
  }
}
