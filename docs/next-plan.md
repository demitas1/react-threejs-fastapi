# 次期実装計画

## 完了済み

### ✅ GLTFSceneLoaderからAnimationControllerを分離

**実装日**: 2025-01-14

**変更内容**:
- `AnimationController.ts` 新規作成 - アニメーション管理専用クラス
- `GLTFSceneLoader.ts` からアニメーション関連コードを削除
- `types.ts` の `SceneLoadResult.animations` を `clips: THREE.AnimationClip[]` に変更
- `useGLTFScene.ts` で `AnimationController` を使用するように変更

**AnimationController API**:
```typescript
// 初期化
new AnimationController(model, clips, { fadeTime: 0.5, autoPlay: true })

// 情報取得
getAnimations(): AnimationInfo[]
getCurrentAnimationName(): string | null
hasAnimations(): boolean

// 再生制御
play(name: string, fadeTime?: number): void
next(fadeTime?: number): string | null
stop(): void
pause(): void
resume(): void

// ループ更新・破棄
update(delta: number): void
dispose(): void
```

---

## 1. AnimationControllerの機能拡張

### 1.1 アニメーションイベント

アニメーションの開始・終了・ループ時にコールバックを呼び出す機能。

```typescript
interface AnimationControllerOptions {
  fadeTime?: number
  autoPlay?: boolean
  onAnimationStart?: (name: string) => void
  onAnimationEnd?: (name: string) => void
  onAnimationLoop?: (name: string, loopCount: number) => void
}
```

**実装方法**:
- Three.jsの`AnimationMixer`の`finished`イベントを利用
- ループ検出は`loop`イベントを利用

### 1.2 アニメーション状態管理

現在のアニメーション状態を取得する機能。

```typescript
enum AnimationState {
  Idle,        // アニメーションなし、または停止中
  Playing,     // 再生中
  Paused,      // 一時停止中
  Transitioning, // クロスフェード中
}

// AnimationControllerに追加
getState(): AnimationState
```

### 1.3 再生速度制御

アニメーションの再生速度を動的に変更する機能。

```typescript
// AnimationControllerに追加
setTimeScale(scale: number): void  // 1.0 = 通常速度
getTimeScale(): number
```

---

## 2. 今後の検討事項

### 2.1 複数モデルのアニメーション同期

複数のGLTFモデルを同時にロードし、アニメーションを同期再生する機能。

**ユースケース**:
- キャラクターとアクセサリーの同期
- グループアニメーション

### 2.2 アニメーションブレンド

複数のアニメーションを同時に再生し、ウェイトでブレンドする機能。

**ユースケース**:
- 歩行と手を振るアニメーションの合成
- 表情と体の動きの独立制御

### 2.3 アニメーション状態マシン

状態遷移ルールを定義し、自動的にアニメーションを切り替える機能。

```typescript
// 概念設計
const stateMachine = new AnimationStateMachine({
  states: {
    idle: { animation: 'Idle' },
    walk: { animation: 'Walk' },
    run: { animation: 'Run' },
  },
  transitions: [
    { from: 'idle', to: 'walk', condition: () => speed > 0 },
    { from: 'walk', to: 'run', condition: () => speed > 5 },
    { from: 'run', to: 'walk', condition: () => speed <= 5 },
    { from: 'walk', to: 'idle', condition: () => speed === 0 },
  ],
})
```
