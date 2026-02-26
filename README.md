# Grow a Tale
**https://www.growatale.com**

Grow a Tale is a **multimodal, AI-powered interactive storytelling game** built to explore the real-world constraints of shipping generative AI products — not just prototyping them.

The application dynamically generates **narrative text, scene imagery, and audio narration** in real time, allowing players to explore branching stories across multiple genres. Under the hood, it coordinates multiple AI modalities concurrently while maintaining a responsive, animated user experience.

This project was intentionally built as a **complete, deployed product**, rather than a demo, in order to surface the practical challenges of latency, concurrency, state management, and cost when working with AI systems in production.

---

## Why This Exists

Early AI demos often appear deceptively simple: call a model, return a response.  
Grow a Tale was built to push beyond that boundary and answer harder, system-level questions:

- How do you generate **text, images, and audio together** without freezing the UI?
- How do you maintain **stateful progression** across many AI-driven steps?
- How do you keep perceived latency acceptable when each AI call may take seconds?
- How do you design prompts that remain coherent across long-running sessions?

In solving these problems, Grow a Tale exposed limitations in naive request/response AI architectures. The lessons learned here directly informed the design of later, more structured systems — including a dedicated **LLM workflow execution engine** extracted into its own repository.

Grow a Tale remains intentionally exploratory; the later systems reflect the production-grade abstractions that emerged from operating this product.

---

## What the Application Does

### 1. Genre-Based Storytelling
- Players choose from predefined genres (e.g. Gothic Horror, Science Fiction, Western).
- Each genre defines its own writer persona, art style, narrative tone, and starting context.

### 2. AI-Generated Scenes
For each scene, the system generates:
- narrative text
- a scene image
- audio narration

All three are generated **concurrently** to reduce total wait time and improve responsiveness.

### 3. Branching Gameplay
- Each scene presents up to three player actions.
- Selecting an action advances the story and triggers the next AI-generated scene.
- Game state (inventory, health, time, weather) evolves with each step.

### 4. Persistent Story State
- Stories and scenes are stored via GraphQL data models.
- Access is owner-scoped — users can only view their own stories.
- Sessions resume cleanly across reloads and navigation.

---

## Key Architectural Decisions

### Concurrent AI Execution
Text, image, and audio generation are executed in parallel using `Promise.all()` rather than sequential calls. This significantly reduces perceived latency and prevents the UI from stalling on long-running operations.

### Explicit, Stateful Game Loop
The game engine maintains structured state for:
- current and prior scenes
- time progression
- weather simulation
- player condition and inventory

This ensures narrative continuity across independent AI generations.

### Persona-Driven Prompt Design
Each genre defines explicit personas for:
- narrative voice
- artistic direction
- thematic constraints

These personas are injected into prompt construction to maintain stylistic consistency across long sessions.

### Progressive, Animated UI
Framer Motion is used to progressively reveal scene elements in sequence:
1. background
2. narrative text
3. audio player
4. action buttons

This keeps users engaged even while AI content is still being generated.

---

## Technology Stack

### Frontend
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Framer Motion

### Backend / Platform
- AWS Amplify Gen 2
- AppSync GraphQL (data + subscriptions)
- Cognito authentication
- S3 for image and audio assets

### AI Services
- OpenAI GPT-4o — narrative text and player choices
- OpenAI DALL·E — scene imagery
- OpenAI TTS — audio narration

---

## Repository Structure (High Level)

- `app/play/` — gameplay routes and UI
- `app/api/openai/` — text, image, and audio generation routes
- `useGameEngine.ts` — state management hook for the game loop
- `generateContent.ts` — AI prompt construction
- `gameUtils.ts` — scene initialization and transitions
- `amplify/` — authentication, data models, and storage definitions

---

## What This Project Demonstrates

- Coordinating multiple AI modalities in real time
- Designing stateful, AI-driven user experiences
- Managing latency without blocking the UI
- Treating prompt design as an engineering concern
- Shipping and operating a complete AI-powered product
- Learning from production constraints and evolving system architecture

---

## Local Development Notes (Optional)

To run locally or deploy via AWS Amplify, an OpenAI API key is required:

```env
OPENAI_API_KEY=your_openai_api_key
```

Configuration can be provided via .env.local or Amplify environment variables.

## License

MIT