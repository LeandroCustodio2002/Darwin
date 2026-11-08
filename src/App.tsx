
import { useState } from 'react'
import './App.css'
import { createInitialWorld } from './simulation/simulation'

function App() {
  const [world] = useState(() => createInitialWorld())

  return (
    <main>
      <h1>Darwin</h1>

      <section>
        <h2>Ecossistema</h2>

        <p>Organismos: {world.organisms.length}</p>
        <p>Alimentos: {world.food.length}</p>
        <p>Geração: 0</p>
        <p>Tick: {world.tick}</p>
      </section>
    </main>
  )
}

export default App
