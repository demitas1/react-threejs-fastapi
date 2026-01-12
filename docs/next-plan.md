# 次期実装計画

## 1. GLTFSceneLoaderからAnimationControllerを分離

### 1.1 背景と目的

現在`GLTFSceneLoader`は以下の責務を持っている：
- GLTFファイルのロード
- メッシュ/マテリアル/テクスチャの管理
- アニメーションの管理（AnimationMixer）

単一責任原則（SRP）に従い、アニメーション管理を独立したクラスに分離する。

### 1.2 メリット

- **責務の明確化**: ローダーはロードのみ、アニメーションは再生制御のみ
- **再利用性**: AnimationControllerを他のローダー（FBX等）でも利用可能
- **テスト容易性**: 各クラスを独立してテスト可能
- **拡張性**: 将来のアニメーション機能拡張（ブレンドツリー、状態遷移等）に対応しやすい

### 1.3 ファイル構成

```
frontend/src/lib/gltf/
├── index.ts                  # エクスポート更新
├── types.ts                  # 型定義（AnimationInfo追加済み）
├── GLTFSceneLoader.ts        # ロードとリソース管理のみ（変更）
├── AnimationController.ts    # アニメーション管理（新規）
└── ResourceDisposer.ts       # 既存のまま
```

### 1.4 インターフェース設計

#### AnimationController

```typescript
import * as THREE from 'three'
import { AnimationInfo } from './types'

interface AnimationControllerOptions {
  fadeTime?: number  // デフォルト: 0.5
  autoPlay?: boolean // デフォルト: true
}

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
  )

  // アニメーション情報取得
  getAnimations(): AnimationInfo[]
  getCurrentAnimationName(): string | null
  hasAnimations(): boolean

  // 再生制御
  play(name: string, fadeTime?: number): void
  next(fadeTime?: number): string | null
  stop(): void
  pause(): void
  resume(): void

  // ループ更新（アニメーションループから呼び出し）
  update(delta: number): void

  // リソース解放
  dispose(): void
}
```

#### GLTFSceneLoader（変更後）

```typescript
// SceneLoadResultにclipsを追加
export interface SceneLoadResult {
  model: THREE.Group
  meshInfos: MeshInfo[]
  clips: THREE.AnimationClip[]  // 生のAnimationClip配列を返す
  meshes: Map<string, THREE.Mesh>
  materials: Map<string, THREE.Material>
  textures: Map<string, THREE.Texture>
}

// GLTFSceneLoaderからアニメーション関連メソッドを削除
export class GLTFSceneLoader implements ISceneLoader {
  // 削除: mixer, clips, actions, currentAction, currentAnimationIndex
  // 削除: processAnimations(), playAnimation(), nextAnimation(), update()
  // 削除: getCurrentAnimationName(), hasAnimations()

  // 変更: processLoadedModel()でclipsを返すのみ
}
```

### 1.5 useGLTFSceneフックの変更

```typescript
import { AnimationController } from '../lib/gltf'

export const useGLTFScene = (options: UseGLTFSceneOptions): UseGLTFSceneReturn => {
  const loaderRef = useRef<GLTFSceneLoader | null>(null)
  const animControllerRef = useRef<AnimationController | null>(null)  // 追加

  // ...

  const loadModel = useCallback(async () => {
    // ...
    const result = await loaderRef.current.load({ url, onProgress })

    // アニメーションコントローラーを初期化
    if (animControllerRef.current) {
      animControllerRef.current.dispose()
    }
    if (result.clips.length > 0) {
      animControllerRef.current = new AnimationController(
        result.model,
        result.clips,
        { autoPlay: true }
      )
      setAnimations(animControllerRef.current.getAnimations())
      setCurrentAnimation(animControllerRef.current.getCurrentAnimationName())
    }
    // ...
  }, [/* ... */])

  // アニメーション操作メソッドはanimControllerRefを参照
  const playAnimation = useCallback((name: string) => {
    animControllerRef.current?.play(name)
    setCurrentAnimation(name)
  }, [])

  const nextAnimation = useCallback(() => {
    const nextName = animControllerRef.current?.next() ?? null
    if (nextName) setCurrentAnimation(nextName)
    return nextName
  }, [])

  const updateAnimation = useCallback((delta: number) => {
    animControllerRef.current?.update(delta)
  }, [])

  // クリーンアップ
  useEffect(() => {
    return () => {
      animControllerRef.current?.dispose()
    }
  }, [])

  // ...
}
```

### 1.6 実装手順

1. **AnimationController.ts作成**
   - 現在のGLTFSceneLoaderからアニメーション関連コードを抽出
   - 新しいインターフェースに合わせて実装

2. **types.ts更新**
   - `SceneLoadResult`から`animations`を削除、`clips`を追加

3. **GLTFSceneLoader.ts変更**
   - アニメーション関連のプロパティとメソッドを削除
   - `processLoadedModel`で`clips`のみを返すように変更

4. **index.ts更新**
   - `AnimationController`をエクスポートに追加

5. **useGLTFScene.ts変更**
   - `AnimationController`を使用するように変更

6. **テスト追加**
   - AnimationControllerの単体テスト作成

### 1.7 互換性への配慮

- `useGLTFScene`の戻り値インターフェースは変更しない
- 利用側（Scene.tsx、App.tsx）への影響を最小限に抑える

### 1.8 将来の拡張可能性

AnimationControllerを分離することで、以下の拡張が容易になる：

- **ブレンドツリー**: 複数アニメーションのブレンド
- **状態遷移**: アニメーション間の遷移ルール定義
- **レイヤー合成**: 上半身/下半身の独立制御
- **イベント通知**: アニメーション完了時のコールバック
- **速度制御**: 再生速度の動的変更

---

## 2. 今後の検討事項

### 2.1 アニメーションイベント

```typescript
interface AnimationControllerOptions {
  onAnimationStart?: (name: string) => void
  onAnimationEnd?: (name: string) => void
  onAnimationLoop?: (name: string, loopCount: number) => void
}
```

### 2.2 アニメーション状態管理

```typescript
enum AnimationState {
  Idle,
  Playing,
  Paused,
  Transitioning,
}

// AnimationControllerに追加
getState(): AnimationState
```

### 2.3 複数モデルのアニメーション同期

複数のGLTFモデルを同時にロードし、アニメーションを同期再生する機能。
