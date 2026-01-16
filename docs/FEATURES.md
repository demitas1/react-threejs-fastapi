# 機能一覧

React + Three.js + FastAPI ボイラープレートの機能一覧ドキュメント

## 1. 概要

### プロジェクトの目的

WebSocket通信を介したリアルタイム3D可視化アプリケーションのボイラープレート。フロントエンドでGLTFモデルを表示・操作し、バックエンドとの双方向通信を行う基盤を提供する。

### 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | React 19, Three.js, TypeScript, Vite |
| バックエンド | Python, FastAPI, uvicorn |
| 通信 | WebSocket |
| コンテナ | Docker, Docker Compose |
| テスト | Vitest, @testing-library/react |
| バージョン管理 | Git, Git LFS（大容量ファイル管理） |

---

## 2. システム構成

### フロントエンド/バックエンドの役割

- **フロントエンド**: 3Dシーンのレンダリング、ユーザーインタラクション、WebSocket通信の管理
- **バックエンド**: WebSocketエンドポイントの提供、静的ファイル（GLTFモデル）の配信

### 通信フロー

```
┌─────────────────┐                    ┌─────────────────┐
│   Frontend      │                    │    Backend      │
│   (React)       │                    │   (FastAPI)     │
├─────────────────┤                    ├─────────────────┤
│                 │  WebSocket接続     │                 │
│  useWebSocket   │ -----------------> │  /ws endpoint   │
│                 │                    │                 │
│                 │  コマンド送信      │                 │
│  MessageForm    │ -----------------> │  メッセージ処理 │
│                 │                    │                 │
│                 │  レスポンス受信    │                 │
│  Scene.tsx      │ <----------------- │  JSON/Binary    │
│                 │                    │                 │
│                 │  GLTFファイル取得  │                 │
│  GLTFLoader     │ -----------------> │  /static/*      │
└─────────────────┘                    └─────────────────┘
```

---

## 3. 主要機能

### 3.1 3Dシーン表示

#### GLTFモデルのロードと表示
- `GLTFSceneLoader`クラスによるGLTF/GLBファイルの動的ロード
- バックエンドの`/static`ディレクトリからモデルを取得
- ロード進捗の監視とエラーハンドリング
- **ローディングプログレスバー**: モデルロード中に進捗を視覚的に表示

#### GLTFアニメーション再生
- GLTFファイル内のアニメーションを動的に読み取り
- ロード完了時にデフォルトアニメーションを自動再生
- **クリックでアニメーション切り替え**: シーンをクリックするたびに次のアニメーションへ巡回
- **0.5秒クロスフェード**: アニメーション切り替え時のスムーズなブレンド
- 複数アニメーション対応（将来の追加・名称変更にも対応）

#### カメラコントロール（6種類対応）

設定ファイルで切り替え可能な6種類のカメラコントロールをサポート。

| type | 説明 | 主な用途 |
|------|------|----------|
| `none` | コントロールなし | 固定カメラ、アニメーション専用シーン |
| `orbit` | OrbitControls | 汎用3Dビューア（デフォルト） |
| `map` | MapControls | 地図・上から見下ろす用途 |
| `trackball` | TrackballControls | 制限なし回転、CAD風操作 |
| `fly` | FlyControls | フライトシミュレータ風 |
| `firstPerson` | FirstPersonControls | 一人称視点 |

**OrbitControls（デフォルト）の機能:**
- マウスドラッグによる回転
- スクロールによるズーム
- ダンピング（慣性）効果のサポート
- 自動回転オプション

#### メッシュの表示/非表示切り替え
- チェックボックスによる個別メッシュの表示制御
- 表示状態の即座な反映

#### メッシュ選択と情報表示
- クリックによるメッシュ選択
- 選択メッシュの詳細情報表示:
  - 位置（X, Y, Z座標）
  - ジオメトリ情報（頂点数、トライアングル数）

### 3.2 WebSocket通信

#### リアルタイム双方向通信
- フロントエンドからバックエンドへのメッセージ送信
- バックエンドからのレスポンス受信と処理

#### 自動再接続機能
- 接続断時に5秒間隔で自動再接続を試行
- 接続状態のリアルタイム表示

#### メッセージタイプの自動判別
- **JSON**: オブジェクト形式のデータ
- **バイナリ**: Blob形式のデータ（RGBA等）
- **テキスト**: 文字列形式のデータ

### 3.3 設定システム

#### 外部JSONによるシーン設定
- `public/config/scene.json`でシーン設定を定義
- 再ビルド不要で設定変更を反映

#### カスタマイズ可能な項目

| カテゴリ | 設定項目 |
|----------|----------|
| 背景 | 背景色 |
| カメラ | FOV、near/far、初期位置 |
| コントロール | タイプ（6種類）、各種パラメータ |
| ライティング | 環境光（色、強度）、指向光（複数設定可能） |

#### コントロール設定オプション

| Controls | 主な設定項目 |
|----------|-------------|
| orbit | enableDamping, dampingFactor, autoRotate, enableZoom, enablePan, minDistance, maxDistance |
| map | enableDamping, dampingFactor, screenSpacePanning, enableZoom |
| trackball | rotateSpeed, zoomSpeed, panSpeed, staticMoving |
| fly | movementSpeed, rollSpeed, dragToLook, autoForward |
| firstPerson | movementSpeed, lookSpeed, lookVertical, activeLook |

#### 設定ファイル例

```json
{
  "background": "#222222",
  "camera": {
    "fov": 75,
    "near": 0.1,
    "far": 100,
    "position": [0, 0, 20]
  },
  "controls": {
    "type": "orbit",
    "enableDamping": true,
    "dampingFactor": 0.25
  },
  "lights": {
    "ambient": { "color": "#ffffff", "intensity": 0.5 },
    "directional": [
      { "color": "#ffffff", "intensity": 1, "position": [5, 5, 5] }
    ]
  }
}
```

#### 固定カメラ（コントロールなし）の設定例

```json
{
  "controls": {
    "type": "none"
  }
}
```

---

## 4. UI機能

### 接続状態表示
- WebSocket接続のリアルタイムステータス表示
- 最後に受信したデータサイズの表示

### メッセージ送信フォーム
- テキスト入力フィールド
- 送信ボタン（接続状態に応じて有効/無効）
- デフォルトメッセージ: "Hello from React"

### シーン情報パネル
- 現在ロードされているシーン名を表示
- URLからファイル名を抽出して表示

### メッシュリスト
- ロードされたメッシュの一覧表示
- 各メッシュに対して:
  - 表示/非表示トグル（チェックボックス）
  - 選択状態の視覚的フィードバック
  - 位置情報の詳細表示

---

## 5. 開発環境

### Docker Compose構成

```bash
# ビルドして起動
docker compose up --build

# バックグラウンドで起動
docker compose up -d

# 停止
docker compose down

# ログ表示
docker compose logs -f
```

| サービス | URL | コンテナ名 |
|----------|-----|------------|
| Frontend | http://localhost:5173 | react-three-frontend |
| Backend | http://localhost:8000 | react-three-backend |

### ホットリロード対応
- `frontend/src/`と`backend/src/`はホストからマウント
- コード変更が自動的に反映される
- 設定ファイル変更時は再ビルドが必要

### ローカル実行

**Backend**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

### Git LFS（大容量ファイル管理）

3Dモデル、画像、音声などの大容量バイナリファイルはGit LFSで管理。

**対象ファイル（.gitattributesで定義）:**

| カテゴリ | 拡張子 |
|----------|--------|
| 3Dモデル | glb, gltf, fbx, obj, mtl, stl, dae, blend, 3ds |
| 画像 | png, jpg, jpeg, gif, bmp, tiff, webp, svg, ico, psd, ai, eps, hdr, exr |
| テクスチャ | ktx, ktx2, dds, basis |
| 音声 | mp3, wav, ogg, flac |
| 動画 | mp4, webm, mov, avi |
| フォント | ttf, otf, woff, woff2 |
| アーカイブ | zip, tar.gz, 7z, rar |

**セットアップ:**
```bash
git lfs install
git lfs pull
```

---

## 6. テスト

### テスト実行方法

```bash
./scripts/test.sh              # ウォッチモードで実行
./scripts/test.sh --run        # 1回実行
./scripts/test.sh --coverage   # カバレッジレポート付き
```

### カバレッジ状況

#### カバレッジ100%

| ファイル | 説明 |
|----------|------|
| `components/controls/ConnectionStatus.tsx` | 接続状態表示 |
| `components/controls/SceneInfo.tsx` | シーン情報表示 |
| `components/controls/MessageForm.tsx` | メッセージ送信フォーム |
| `components/controls/MeshList.tsx` | メッシュリスト |
| `components/controls/ControlPanel.tsx` | コントロールパネル統合 |
| `config/loader.ts` | 設定ローダー |
| `config/defaults.ts` | デフォルト値 |

#### カバレッジ90%以上

| ファイル | カバレッジ | 未カバー部分 |
|----------|------------|--------------|
| `hooks/useSceneConfig.ts` | 91% | 一部エラーハンドリング |
| `hooks/useWebSocket.ts` | 92% | Blobメッセージ処理 |

#### 未実装テスト

以下はThree.js依存が大きくモック化が複雑なため未実装:
- `hooks/useGLTFScene.ts`
- `components/Scene.tsx`
- `App.tsx`

---

## 7. 現状の制約

### 7.1 メッシュ回転処理

`Scene.tsx`のアニメーションループ内で特定のメッシュ名にハードコードされた回転処理が存在する（デモ用）。

```typescript
// Scene.tsx
const cube = getMeshRef.current('Cube')
if (cube) {
  cube.rotation.x += 0.01
}

const icosphere = getMeshRef.current('Icosphere')
if (icosphere) {
  icosphere.rotation.y += 0.01
}
```

**制約事項:**
- `Cube`と`Icosphere`という特定のメッシュ名に依存
- 異なる構造のGLTFモデルでは動作しない
- 回転処理追加にはコード修正が必要

> **注**: GLTFファイル内蔵のアニメーション（スキンメッシュアニメーション等）は`GLTFSceneLoader`のアニメーション機能で対応済み。

### 7.2 WebSocketコマンド体系

バックエンドのメッセージ処理が固定文字列マッチングによる試験的実装となっている。

```python
# main.py
if message == "request json":
    # 固定のテストJSONを返す
elif message == "new scene1":
    # TestCube.glbへのシーン切り替えコマンド
elif message == "new scene2":
    # Xbot-animations.glb（アニメーション付き）へのシーン切り替えコマンド
elif message == "send binary test":
    # ランダムなRGBAバイナリを返す
```

**制約事項:**
- 固定文字列（`"request json"`, `"new scene1"`, `"new scene2"`, `"send binary test"`）のみ対応
- テスト用の固定レスポンスのみで実用的な機能がない
- コマンド拡張に都度コード修正が必要
- エラーハンドリングやバリデーションが不十分

---

## 8. 拡張ポイント・将来計画

### 8.1 現在可能な拡張

#### 新しいGLTFモデルの追加
1. `backend/static/`にGLB/GLTFファイルを配置
2. WebSocketコマンドまたはUIからパスを指定してロード

#### WebSocketコマンドの追加
1. `backend/src/main.py`の`websocket_endpoint`にメッセージハンドラを追加
2. フロントエンドで対応するレスポンス処理を実装

#### シーン設定の拡張
1. `frontend/src/config/types.ts`に新しい設定項目の型を追加
2. `frontend/src/config/defaults.ts`にデフォルト値を追加
3. `frontend/src/components/Scene.tsx`で設定を適用

### 8.2 将来の改善計画

#### 宣言的メッシュアニメーション設定

現在ハードコードされているメッシュ回転処理を、外部設定ファイルで定義可能にする計画。

**想定する設定形式例:**
```json
{
  "meshAnimations": [
    {
      "target": "Cube*",
      "type": "rotate",
      "axis": "x",
      "speed": 0.01
    },
    {
      "target": "*sphere*",
      "type": "rotate",
      "axis": "y",
      "speed": 0.02
    }
  ]
}
```

> **注**: GLTFファイル内蔵アニメーション（スキンメッシュ等）は既に`GLTFSceneLoader`で対応済み。

#### WebSocketコマンドプロトコルの整備

構造化されたコマンド形式とハンドラ登録機構による拡張性向上を計画。

**設計方針:**
- JSON-RPCライクなリクエスト/レスポンス形式
- コマンドハンドラの登録機構
- エラーレスポンスの標準化
- 型安全なメッセージ定義

**想定するプロトコル例:**
```json
// リクエスト
{
  "jsonrpc": "2.0",
  "method": "scene.load",
  "params": { "path": "static/Model.glb" },
  "id": 1
}

// レスポンス
{
  "jsonrpc": "2.0",
  "result": { "success": true, "meshCount": 5 },
  "id": 1
}
```

**実装予定の機能:**
- シーン一覧の取得
- 動的なモデル切り替え
- メッシュ操作（位置・回転・スケール変更）
- リアルタイムデータストリーミング
- バッチコマンド実行
