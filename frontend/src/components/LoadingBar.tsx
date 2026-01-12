interface LoadingBarProps {
  progress: number
  visible: boolean
}

const LoadingBar = ({ progress, visible }: LoadingBarProps) => {
  if (!visible) {
    return null
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.barBase}>
        <div style={{ ...styles.bar, width: `${progress}%` }} />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: '#000',
    opacity: 0.7,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1111,
  },
  barBase: {
    background: '#aaa',
    width: '50%',
    minWidth: '250px',
    borderRadius: '10px',
    height: '15px',
  },
  bar: {
    background: '#22a',
    borderRadius: '10px',
    height: '100%',
    transition: 'width 0.1s ease-out',
  },
}

export default LoadingBar
