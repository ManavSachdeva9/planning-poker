import { useState, useEffect } from 'react'
import { GameProvider } from './context/GameContext'
import { HomePage } from './components/HomePage'
import { JoinPage } from './components/JoinPage'
import { GameRoom } from './components/GameRoom'

type AppView = 'home' | 'join' | 'game'

function AppContent() {
  const [view, setView] = useState<AppView>('home')
  const [roomIdFromUrl, setRoomIdFromUrl] = useState<string>('')

  useEffect(() => {
    // Check if there's a room parameter in the URL (invite link)
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) {
      setRoomIdFromUrl(room.toUpperCase())
      setView('join')
    }
  }, [])

  switch (view) {
    case 'home':
      return <HomePage onRoomCreated={() => setView('game')} />
    case 'join':
      return (
        <JoinPage
          roomId={roomIdFromUrl}
          onJoined={() => setView('game')}
        />
      )
    case 'game':
      return <GameRoom />
    default:
      return <HomePage onRoomCreated={() => setView('game')} />
  }
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  )
}

export default App
