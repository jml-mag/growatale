Grow a Tale

https://www.growatale.com

A multimodal, AI-powered interactive storytelling game built to explore the real-world constraints of shipping AI-driven user experiences.

Grow a Tale dynamically generates narrative text, scene imagery, and audio narration in real time, allowing players to explore branching stories across multiple genres. Under the hood, it coordinates multiple AI modalities concurrently while maintaining a responsive, animated UI.

This project was intentionally built as a complete, deployed product — not a demo — in order to surface the practical challenges of latency, concurrency, state management, and cost when working with generative AI.

Why This Exists

Early AI demos often look deceptively simple: call a model, return a response.
Grow a Tale was built to go several steps further and answer harder questions:

How do you generate text, images, and audio together without freezing the UI?

How do you maintain stateful progression across many AI-driven steps?

How do you keep wait times acceptable when each AI call may take seconds?

How do you design prompts that remain coherent across long-running sessions?

This project intentionally pushed beyond “prompt → response” patterns and directly informed later work on a dedicated LLM workflow execution engine.

What the Application Does

Genre-Based Storytelling

Players choose from predefined genres (e.g. Gothic Horror, Sci-Fi, Western).

Each genre has its own writer persona, art style, narrative tone, and starting context.

AI-Generated Scenes

For each scene, the system generates:

narrative text

a scene image

audio narration

All three are generated concurrently to minimize perceived latency.

Branching Gameplay

Each scene includes up to three player actions.

Choosing an action advances the story, creating a new AI-generated scene.

State (inventory, health, time, weather) evolves with each step.

Persistent Story State

Stories and scenes are stored via GraphQL models.

Users can only access their own stories.

Sessions resume cleanly across reloads.

Key Architectural Decisions
Concurrent AI Execution

Text, image, and audio generation run in parallel using Promise.all() to avoid serialized latency. This significantly improves responsiveness compared to sequential calls.

Stateful Game Loop

The game engine maintains explicit state for:

current scene

prior scenes

time progression

weather changes

player condition

This ensures narrative continuity across AI generations.

Persona-Driven Prompt Design

Each genre defines:

author voice

artistic direction

narrative constraints

These personas are injected into prompt construction to keep output stylistically consistent over time.

Animated, Progressive UI

Framer Motion is used to stagger scene elements:

background

text

audio player

action buttons

This keeps users engaged even while AI content is still loading.

Technology Stack

Frontend

Next.js 14 (App Router)

React 18 + TypeScript

Tailwind CSS

Framer Motion

Backend / Platform

AWS Amplify Gen 2

AppSync GraphQL (data + subscriptions)

Cognito authentication

S3 for image and audio assets

AI Services

OpenAI GPT-4o — narrative text + choices

OpenAI DALL·E — scene imagery

OpenAI TTS — audio narration

Repository Structure (High Level)

app/play/ — gameplay routes and UI

app/api/openai/ — text, image, and audio generation routes

useGameEngine.ts — state management hook for the game loop

generateContent.ts — AI prompt construction

gameUtils.ts — scene transitions and initialization

amplify/ — authentication, data models, storage

What This Project Demonstrates

Coordinating multiple AI modalities in real time

Designing stateful AI-driven user experiences

Managing latency without blocking the UI

Prompt design as a first-class engineering concern

Shipping and operating a complete AI product

Local Development Notes (Optional)

To run locally or deploy via AWS Amplify, an OpenAI API key is required.

OPENAI_API_KEY=your_openai_api_key

Configuration can be provided via .env.local or Amplify environment variables.

License

MIT