
import { useState } from 'react'
import './App.css'
import { createInitialWorld } from './simulation/simulation'
import WorldCanvas from './components/WorldCanvas'

function App() {
  const [world] = useState(() => createInitialWorld())

  const generation = Math.max(
    0,
    ...world.organisms.map((organism) => organism.generation)
  )

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">D</span>
          <h1>darwin</h1>
        </div>

        <div className="simulation-status">
          <span className="status-indicator" />
          Ecossistema inicializado
        </div>
      </header>

      <div className="dashboard">
        <section className="simulation-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">AMBIENTE 001</span>
              <h2>Ecossistema</h2>
            </div>

            <span className="world-dimensions">
              {world.width} × {world.height}
            </span>
          </div>

          <div className="world-container">
            <WorldCanvas world={world} />

            <div className="world-overlay">
              <span>LIVE VIEW</span>
              <span>● INITIAL STATE</span>
            </div>
          </div>

          <div className="world-legend">
            <span>
              <i className="legend-organism" />
              Organismos
            </span>

            <span>
              <i className="legend-food" />
              Alimentos
            </span>
          </div>
        </section>

        <aside className="sidebar">
          <section className="panel">
            <span className="eyebrow">POPULAÇÃO</span>
            <div className="main-stat">
              {world.organisms.length}
              <span>organismos vivos</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">RECURSOS</span>
            <div className="stat-value">
              <span className="stat-dot food-dot" />
              {world.food.length}
              <span>unidades de alimento</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">EVOLUÇÃO</span>
            <div className="stat-value">
              {generation}
              <span>gerações</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">TEMPO DE SIMULAÇÃO</span>
            <div className="stat-value">
              {world.tick}
              <span>ticks</span>
            </div>
          </section>

          <section className="panel info-panel">
            <span className="eyebrow">SOBRE O AMBIENTE</span>
            <p>
              Um ecossistema artificial onde organismos interagem
              com recursos e evoluem através das gerações.
            </p>
          </section>
        </aside>
      </div>

      <footer className="app-footer">
        <span>DARWIN PROJECT</span>
        <span>ARTIFICIAL LIFE SIMULATOR</span>
      </footer>
    </main>
  )
}

export default App
