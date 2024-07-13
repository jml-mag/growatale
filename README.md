# Grow a Tale

# Setup Instructions

## Environment Variables

To run Grow a Tale locally and deploy it with AWS Amplify, you need to configure the environment variables for the OpenAI API key.

### Local Setup

1. Create a `.env.local` file in the root directory of your project.
2. Add your OpenAI API key to the `.env.local` file:

   ```env
   OPENAI_API_KEY=your_openai_api_key

### AWS Amplify Setup
Go to the AWS Amplify console.

Navigate to your project and select the Hosting section.

Click on Environment variables.

Add a new environment variable with the following key and value:

Key: OPENAI_API_KEY
Value: your_openai_api_key

**Grow a Tale** is a proof-of-concept interactive text adventure game that dynamically generates story content using AI technologies. This application leverages modern web technologies to create engaging experiences, showcasing the potential for similar products built with this stack. While there are many optimizations left to explore, Grow a Tale serves as an inspiring demonstration of what's possible.

## Key Features

- **Interactive Gameplay**: Players navigate through dynamically generated story scenes, making choices that influence the narrative and their journey.
- **AI-Driven Content**: OpenAI's APIs are used to create vivid images, engaging audio, and immersive storylines in real-time based on player inputs.
- **Robust Backend**: AWS Amplify Gen 2 manages authentication, data storage, and backend logic, ensuring a secure and scalable infrastructure.
- **Responsive Frontend**: Built with Next.js and styled using Tailwind CSS, the frontend provides a seamless and engaging user experience.

## Frontend

The frontend of the application is built using Next.js and Tailwind CSS for styling. It consists of various pages and components to manage the UI and user interactions. Key elements include:

1. **Fonts Configuration**: Configures Google Fonts for use across the application (fonts.ts).
2. **Layout**: Sets up the HTML structure, including global styles and metadata (layout.tsx).
3. **Home Page**: Serves as the main landing page with a background image and navigation to the game (page.tsx).
4. **Global Styles**: Contains global CSS rules using Tailwind CSS (globals.css).
5. **Game Components**: Manages the game's logic, user actions, and state management through components like GameScreen, AudioPlayer, and hooks such as useGameEngine.

## Backend

The backend is designed to handle API requests, manage game data, and integrate authentication using AWS Amplify Gen 2. Key elements include:

### Amplify Gen 2

AWS Amplify Gen 2 is used to manage backend resources and configurations. The key components include:

1. **Backend Configuration**: Defines the overall backend setup, including authentication, data, and storage resources (amplify/backend.ts).
2. **Authentication**: Configures user authentication settings, enabling email verification and sign-in capabilities (amplify/auth/resource.ts).
3. **Data Models**: Defines the schema for storing game-related data, such as stories, scenes, and player actions (amplify/data/resource.ts).
4. **Storage**: Configures storage settings, allowing authenticated users to read, write, and delete image and audio files (amplify/storage/resource.ts).

### API Integration

1. **OpenAI API Routes**: Handles image, audio, and text generation using OpenAI's API (api/openai/ folder).
    - **Image Generation**: Handled by api/openai/image/route.ts for generating visual content based on prompts.
    - **Audio Generation**: Handled by api/openai/audio/route.ts for generating audio content from text prompts.
    - **Text Generation**: Handled by api/openai/primary/route.ts for generating narrative text and player options.

### Data Management

The backend utilizes AWS Amplify's data storage capabilities to store and manage game data. Key files include:

- **Data Models**: Defined in amplify/data/resource.ts, detailing the schema for storing game-related data like stories, scenes, and player actions.
- **Database Operations**: Functions within the backend handle the creation, updating, and retrieval of game data.

### Authentication

Authentication is managed using Amplify's auth resource configuration, enabling secure user sign-in and sign-out functionalities. This ensures that only authenticated users can access and interact with the game's data.

## AI Integration

AI functionalities are integrated to generate game content dynamically. Key elements include:

1. **Image Generation**: Handled by api/openai/image/route.ts for generating visual content based on prompts.
2. **Audio Generation**: Handled by api/openai/audio/route.ts for generating audio content from text prompts.
3. **Text Generation**: Handled by api/openai/primary/route.ts for generating narrative text, creating story scenes and player options based on user input.

## Summary of Integration

- **Frontend Components** interact with backend APIs to fetch and display game content dynamically.
- **Backend APIs** handle requests for generating and storing game content using OpenAI's services and AWS Amplify's data storage.
- **AI Services** provide dynamic content generation, enriching the game experience with unique images, audio, and narrative text.
- **Amplify Gen 2** manages authentication, data, and storage, ensuring secure and efficient backend operations.

Overall, the application integrates various technologies to provide a dynamic, interactive game experience with robust backend support and AI-driven content generation.
