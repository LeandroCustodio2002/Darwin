
import { useEffect, useState } from 'react'
import './App.css'
import { advanceWorld, createInitialWorld } from './simulation/simulation'
import { calculateStatistics } from './simulation/statistics'
import WorldCanvas from './components/WorldCanvas'

function App() {
  const [world, setWorld] = useState(() => createInitialWorld())

  useEffect(() => {
    let animation_frame = 0
    let previous_time = 0
    let accumulator = 0

    const fixed_delta = 1 / 30

    const update = (current_time: number) => {
      if (previous_time === 0) {
        previous_time = current_time
      }

      const elapsed = Math.min(
        (current_time - previous_time) / 1000,
        0.05
      )

      previous_time = current_time
      accumulator += elapsed

      while (accumulator >= fixed_delta) {
        setWorld((current_world) =>
          advanceWorld(current_world, fixed_delta)
        )

        accumulator -= fixed_delta
      }

      animation_frame = requestAnimationFrame(update)
    }

    animation_frame = requestAnimationFrame(update)

    return () => cancelAnimationFrame(animation_frame)
  }, [])

  const statistics = calculateStatistics(world)

  return (
    <main className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-icon">D</span>
          <h1>darwin</h1>
        </div>

        <div className="simulation-status">
          <span className="status-indicator" />
          Simulação em execução
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
              <span>● SIMULATION RUNNING</span>
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
              {statistics.population}
              <span>organismos vivos</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">RECURSOS</span>
            <div className="stat-value">
              <span className="stat-dot food-dot" />
              {statistics.food_count}
              <span>unidades de alimento</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">EVOLUÇÃO</span>
            <div className="stat-value">
              {statistics.max_generation}
              <span>geração máxima</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">VELOCIDADE MÉDIA</span>
            <div className="stat-value">
              {statistics.average_speed.toFixed(1)}
              <span>unidades</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">VISÃO MÉDIA</span>
            <div className="stat-value">
              {statistics.average_vision.toFixed(1)}
              <span>unidades</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">METABOLISMO MÉDIO</span>
            <div className="stat-value">
              {statistics.average_metabolism.toFixed(2)}
              <span>unidades</span>
            </div>
          </section>

          <section className="panel">
            <span className="eyebrow">ENERGIA MÉDIA</span>
            <div className="stat-value">
              {statistics.average_energy.toFixed(1)}
              <span>unidades</span>
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
