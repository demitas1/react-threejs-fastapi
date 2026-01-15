# Mixamo アニメーションを Blender 4.5 で統合し glTF エクスポートする手順書

## 概要

MixamoからダウンロードしたFBXアニメーションを Blender 4.5 で1つのキャラクターに統合し、Three.js等で使用できるglTF形式でエクスポートするワークフローです。

## 前提条件

- Blender 4.5
- Mixamo アカウント
- 同一キャラクター（Xbot）で複数のアニメーションをダウンロード済み

---

## 1. Mixamo でアニメーションをダウンロード

### 1.1 FBX1（Idle）のダウンロード

1. [Mixamo](https://www.mixamo.com/) にアクセス
2. Characters から **Xbot** を選択
3. Animations から **Idle** を選択

![Mixamo Idle アニメーション選択画面](images/mixamo-idle-animation.jpg)

4. Download Settings:
   - Format: **FBX Binary (.fbx)**
   - Skin: **With Skin**（1つ目のみ）
   - Frames per Second: **30**
   - Keyframe Reduction: **none**

![Download Settings - With Skin](images/mixamo-download-with-skin.jpg)

5. Download

### 1.2 FBX2（Walk）のダウンロード

1. 同じ **Xbot** キャラクターを選択したまま
2. Animations から **Walk** を選択

![Mixamo Walking アニメーション選択画面](images/mixamo-walking-animation.jpg)

3. Download Settings:
   - Format: **FBX Binary (.fbx)**
   - Skin: **Without Skin**（2つ目以降はスキン不要）
   - Frames per Second: **30**
   - Keyframe Reduction: **none**

![Download Settings - Without Skin](images/mixamo-download-without-skin.jpg)

4. Download

---

## 2. FBX1（Idle）を Blender にインポート

### 2.1 インポート

1. Blender を起動し、新規ファイルを作成
2. デフォルトのCube、Light、Cameraを削除
3. `File → Import → FBX (.fbx)` を選択
4. Idle の FBX ファイルを選択してインポート

### 2.2 インポート結果の確認

Outliner に以下の構造が表示されます：

```
Collection
└── Armature
    ├── Animation
    │   └── Armature|mixamo.com|Layer0
    │       └── Idle (NLAストリップ)
    ├── Beta_Joints (メッシュ)
    └── Beta_Surface (メッシュ)
```

### 2.3 Armature を Xbot にリネーム

1. Outliner で **Armature** を選択
2. ダブルクリックまたは `F2` キー
3. **Xbot** に変更

---

## 3. アニメーション名を整理（Idle）

### 3.1 Action Editor でアクション名を確認・変更

1. 画面下部のエディタを **Dope Sheet** に変更
2. モードを **Action Editor** に変更
3. 右上のアクション名フィールドを確認
   - `Armature|mixamo.com|Layer0` → **Idle** にリネーム
4. Slot名も必要に応じて **Idle** に統一

### 3.2 NLA Editor で構造を確認

1. エディタを **NLA Editor** に変更
2. 以下の構造になっていることを確認：

```
Xbot
└── Idle [====ストリップ====]
```

> **注意**: もし `<No Action>` というトラックと別に Idle ストリップがある場合は、Action Editor で Idle を選択し `Action → Push Down` を実行してNLAに統合してください。

---

## 4. FBX2（Walk）をインポート

### 4.1 追加インポート

1. `File → Import → FBX (.fbx)` を選択
2. Walk の FBX ファイルを選択してインポート

### 4.2 インポート結果

新たに **Armature** が追加されます：

```
Collection
├── Xbot (Idle アニメーション付き)
└── Armature (Walk アニメーション付き) ← 新規追加
```

---

## 5. Walk アニメーションを Xbot に追加

### 5.1 Armature 側のアクション名を変更

1. **Armature**（新しくインポートした方）を選択
2. Action Editor でアクション名を `Armature|mixamo.com|Layer0` → **Walk** にリネーム

### 5.2 Xbot に新しい NLA トラックを追加

1. **Xbot** を選択
2. **NLA Editor** を開く
3. 左側のリストで **Xbot** の行を**右クリック**
4. **Add Tracks** を選択

### 5.3 Walk ストリップを追加

1. 新しく追加された空のトラック（NlaTrack）の**右側タイムライン部分**をクリック
2. **Shift + A** を押す
3. **Add Action Strip** を選択
4. リストから **Walk** を選択

### 5.4 トラック名を整理

1. NLA Editor で追加したトラック名「NlaTrack」をダブルクリック
2. **Walk** にリネーム
3. 不要な `<No Action>` トラックがあれば右クリック → **Delete Tracks** で削除

### 5.5 完成した構造

```
Xbot
├── NLA Tracks
│   ├── Walk  [=== Walk ===]
│   └── Idle  [=== Idle ===]
```

---

## 6. アニメーションのプレビュー確認

### 6.1 Walk の確認

1. NLA Editor で **Idle** トラックのチェックボックス ☑ を**外す**（ミュート）
2. タイムラインで再生（スペースキー）
3. Walk アニメーションが正しく再生されることを確認

### 6.2 Idle の確認

1. **Idle** トラックのチェックボックスを**オン**
2. **Walk** トラックのチェックボックスを**オフ**
3. Idle アニメーションが正しく再生されることを確認

### 6.3 Tweak Mode での確認（代替方法）

1. 確認したいストリップ（オレンジのバー）を選択
2. **Tab** キーで Tweak Mode に入る
3. そのアクションのみがプレビューされる
4. 再度 **Tab** で戻る

---

## 7. 不要なオブジェクトを削除

1. Outliner で **Armature**（Walk インポート元）を選択
2. **X** キーまたは右クリック → **Delete** で削除

### 最終的な構造

```
Collection
└── Xbot
    ├── Animation
    │   └── NLA Tracks
    │       ├── Walk
    │       └── Idle
    ├── Beta_Joints
    └── Beta_Surface
```

---

## 8. glTF としてエクスポート

### 8.1 エクスポート設定

1. `File → Export → glTF 2.0 (.glb/.gltf)` を選択
2. 以下の設定を確認：

| カテゴリ | 設定項目 | 推奨値 |
|---------|---------|--------|
| Format | | glTF Binary (.glb) |
| Include | Selected Objects | オフ（全体をエクスポート） |
| Data → Mesh | Apply Modifiers | オン |
| Data → Animation | ☑ Animation | オン |
| Animation | Export | NLA Tracks または Actions |
| Animation | ☑ Export Deformation Bones Only | オン推奨 |

3. ファイル名を指定して **Export glTF 2.0** をクリック

---

## 9. エクスポート結果の確認

### 9.1 Three.js での読み込み例

```javascript
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.glb', (gltf) => {
  const model = gltf.scene;
  scene.add(model);

  // アニメーション一覧を確認
  console.log(gltf.animations.map(clip => clip.name));
  // → ["Idle", "Walk"]

  // AnimationMixer を作成
  const mixer = new THREE.AnimationMixer(model);

  // 名前でクリップを取得
  const idleClip = gltf.animations.find(c => c.name === 'Idle');
  const walkClip = gltf.animations.find(c => c.name === 'Walk');

  // アクションを作成
  const idleAction = mixer.clipAction(idleClip);
  const walkAction = mixer.clipAction(walkClip);

  // Idle を再生
  idleAction.play();

  // アニメーションループ内で更新
  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    mixer.update(delta);
    renderer.render(scene, camera);
  }
  animate();
});
```

### 9.2 アニメーション切り替え例

```javascript
// Walk に切り替え（クロスフェード）
function switchToWalk() {
  idleAction.fadeOut(0.5);
  walkAction.reset().fadeIn(0.5).play();
}

// Idle に切り替え（クロスフェード）
function switchToIdle() {
  walkAction.fadeOut(0.5);
  idleAction.reset().fadeIn(0.5).play();
}
```

---

## トラブルシューティング

### アニメーション名が期待通りにならない

glTFエクスポート後に名前が異なる場合は、Three.js側で実際の名前を確認：

```javascript
gltf.animations.forEach((clip, i) => {
  console.log(`[${i}] ${clip.name}: ${clip.duration}秒`);
});
```

### アニメーションがエクスポートされない

1. エクスポート設定で **Animation** が有効になっているか確認
2. NLA Editorで各トラックのチェックボックス ☑ がオンになっているか確認
3. ストリップがミュートされていないか確認

### ボーン名の不一致

異なるキャラクターのアニメーションを流用する場合、ボーン名が一致している必要があります。Mixamoの同一キャラクターであれば問題ありません。

---

## 補足: Blender 4.5 の Slotted Actions システム

Blender 4.4以降、アクションシステムに**Slot**の概念が導入されました。

- **Action**: アニメーションデータブロック全体
- **Slot**: アクション内のチャンネルグループ

Action Editor の右上には2つのフィールドがあり、左が Action名、右が Slot名です。glTFエクスポート時は主に Action名が使用されます。

---

## 参考リンク

- [Mixamo](https://www.mixamo.com/)
- [Blender Manual - NLA Editor](https://docs.blender.org/manual/en/latest/editors/nla/index.html)
- [Three.js Animation System](https://threejs.org/docs/#manual/en/introduction/Animation-system)
