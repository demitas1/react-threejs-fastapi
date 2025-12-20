# React - ThreeJS - FastAPI boilerplate

React + Three.js + FastAPI による3D可視化アプリケーションのボイラープレート。

## 必要条件

- Docker
- Docker Compose

## 起動

```bash
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## 停止

```bash
docker compose down
```

## 開発

`frontend/src/` および `backend/src/` はホストからマウントされており、編集すると自動的に反映されます。

### 本番ビルド

```bash
# Dockerコンテナ内で実行
docker compose exec frontend npm run build
```

### 型チェック

```bash
docker compose exec frontend npx tsc --noEmit
```

## ディレクトリ構造

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── src/
│   │   └── main.py                  # FastAPI + WebSocketサーバー
│   └── static/                      # GLTFファイル配置用
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx                  # メインコンポーネント、状態管理
│       ├── main.tsx                 # エントリーポイント
│       ├── style.css
│       ├── components/
│       │   ├── Scene.tsx            # Three.jsシーン描画
│       │   └── controls/
│       │       ├── index.ts         # バレルエクスポート
│       │       ├── ControlPanel.tsx # コントロール全体のコンテナ
│       │       ├── ConnectionStatus.tsx  # 接続状態表示
│       │       ├── MessageForm.tsx  # メッセージ送信フォーム
│       │       ├── SceneInfo.tsx    # シーン情報表示
│       │       └── MeshList.tsx     # メッシュ一覧と可視性制御
│       ├── hooks/
│       │   ├── useWebSocket.ts      # WebSocket通信ロジック
│       │   └── useGLTFScene.ts      # GLTFロード管理
│       ├── lib/
│       │   └── gltf/
│       │       ├── index.ts         # バレルエクスポート
│       │       ├── types.ts         # 型定義
│       │       ├── GLTFSceneLoader.ts   # GLTFロード・クリーンアップ
│       │       └── ResourceDisposer.ts  # リソース解放ユーティリティ
│       └── types/
│           └── gltf.ts              # 型定義（後方互換用）
└── README.md
```

## License

MIT
