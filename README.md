<div align="center">

# 🧬 Darwin — Evolutionary Ecosystem Simulator


**An artificial ecosystem where organisms compete, survive, reproduce and evolve through generations.**

<p align="center">
  <a href="https://leandrocustodio2002.github.io/Darwin/">
    **🚀 Try Darwin Online**
  </a>
</p>

![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![HTML Canvas](https://img.shields.io/badge/HTML_Canvas-E34F26?logo=html5&logoColor=white)

<img width="100%" alt="Darwin — Evolutionary Ecosystem Simulation" src="https://github.com/user-attachments/assets/7ed6e1c9-71b5-4a05-8af8-0c2dbd8a2c7a" />

### 🔗 [Explore the repository](https://github.com/LeandroCustodio2002/Darwin)

</div>

---

## 🌱 What is Darwin?

**Darwin** is an artificial life experiment built to explore how ecosystems emerge, interact and evolve over time.

The simulation creates a world populated by different organisms, each with its own characteristics, behaviors, dietary preferences and survival strategies.

Organisms search for resources, compete with other species, reproduce and pass genetic traits to future generations.

There is no predefined outcome: the ecosystem develops dynamically through the interactions between its inhabitants.

The goal is to create a balanced, evolving environment where different survival strategies can coexist.

## 🧬 Species

Darwin currently features six different species, each with its own ecological role and behavior.

| Species | Color | Diet | Behavior |
|---|---|---|---|
| Herbivore | 🟢 Green | Food | Feeds exclusively on environmental resources and avoids hunting. |
| Carnivore | 🔴 Red | Organisms | Hunts other organisms to survive. |
| Omnivore | 🟠 Orange | Food & Organisms | Adapts its diet by consuming both resources and prey. |
| Predator | 🟣 Purple | Organisms | A powerful hunter that targets specific prey. |
| Decomposer | 🟢 Teal | Dead organisms | Consumes dead organisms, recycling resources within the ecosystem. |
| Decomposer Hunter | 🔵 Blue | Food & Organisms | Specializes in hunting decomposers. |

Each species has different attributes, including speed, vision, metabolism and aggression, influencing how it behaves and interacts with the environment.

## ⚙️ Ecosystem Mechanics

### 🌿 Resources and Survival

- Organisms must find food to sustain their energy.
- Food resources regenerate over time.
- Different species have different dietary requirements.
- Energy consumption and metabolism influence survival.
- Organisms can die when they fail to sustain their energy needs.

### 🐺 Hunting and Interactions

Species follow different hunting rules and ecological relationships.

- Herbivores focus exclusively on environmental food.
- Carnivores hunt other organisms.
- Omnivores can consume both food and prey.
- Predators target specific organisms and ignore herbivores.
- Decomposers consume dead organisms.
- Decomposer hunters specialize in hunting decomposers.

These interactions create a food web where the survival of one species can directly affect the population of others.

### 🧬 Genetics and Evolution

Organisms carry genetic traits that influence their characteristics and behavior.

As generations pass, genetic inheritance and mutations introduce variation into the population.

These differences can influence:

- Movement speed
- Vision range
- Metabolism
- Energy efficiency
- Survival capabilities

Over time, environmental pressure and competition can favor certain traits over others.

### 📊 Real-time Statistics

The simulation includes a live dashboard to observe how the ecosystem changes.

It tracks metrics such as:

- Total population
- Available food
- Maximum generation
- Average speed
- Average vision
- Average metabolism
- Average energy
- Simulation ticks

These metrics help visualize population dynamics and evolutionary changes over time.

## 🏗️ Architecture

The project separates simulation logic from rendering and interface components.

```text
src/
├── components/
│   └── WorldCanvas.tsx
│
├── rendering/
│   └── ...
│
├── simulation/
│   ├── entities/
│   ├── genetics/
│   ├── world/
│   ├── simulation.ts
│   └── statistics.ts
│
├── App.tsx
└── main.tsx
```

The simulation engine operates independently from React, while the Canvas handles the visual representation of the world.

The simulation uses a fixed update rate of 30 ticks per second, coordinated through `requestAnimationFrame`.

## 🚀 Running Locally

### Requirements

- Node.js
- npm

### Installation

Clone the repository:

```bash
git clone https://github.com/LeandroCustodio2002/Darwin.git
cd Darwin
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Type-checks and builds the project |
| `npm run lint` | Runs ESLint |
| `npm run preview` | Previews the production build |

## 🛠️ Tech Stack

- **React** — User interface and application state.
- **TypeScript** — Typed simulation models and application logic.
- **Vite** — Development server and build tooling.
- **HTML Canvas** — Real-time ecosystem rendering.
- **ESLint** — Code quality and consistency.

## 🎯 Project Goals

Darwin is an ongoing experiment in artificial life, evolutionary systems and emergent behavior.

Some of the main goals are:

- Build a stable ecosystem with multiple interacting species.
- Explore natural selection through genetic variation.
- Balance predator-prey relationships.
- Observe population dynamics across generations.
- Create an environment where complex behavior emerges from relatively simple rules.

---

<div align="center">

**Built as an experiment in artificial life, evolution and emergent ecosystems.**

🧬 *Survive. Adapt. Evolve.*

</div>
