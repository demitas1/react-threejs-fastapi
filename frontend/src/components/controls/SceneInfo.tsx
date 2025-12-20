interface SceneInfoProps {
  sceneUrl: string
}

export const SceneInfo = ({ sceneUrl }: SceneInfoProps) => {
  const sceneName = sceneUrl ? sceneUrl.split('/').pop() : 'No scene loaded'

  return (
    <div className="scene-info">
      <h3>Current Scene</h3>
      <p>{sceneName}</p>
    </div>
  )
}
