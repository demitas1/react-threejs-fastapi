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

## ディレクトリ構造

```
.
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── src/
│   │   └── main.py
│   └── static/
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── style.css
│       ├── components/
│       │   └── Scene.tsx
│       └── types/
│           └── gltf.ts
└── README.md
```

## License

MIT
