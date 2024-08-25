export default function About() {
    return (
        <div className="p-8 bg-slate-950 text-stone-100">
            <p className="mb-4">
                Grow a Tale creates an immersive interactive storytelling experience powered by Next.js, AWS Amplify, and various AI services.
            </p>
            <h2 className="text-2xl font-bold mb-4">User Experience</h2>
            <p className="mb-6">
                When users visit the &quot;Grow a Tale&quot; website, they are greeted with a visually stunning homepage featuring a beautifully animated background and the &quot;Grow a Tale&quot; logo. This is achieved using the Framer Motion library for smooth animations. The interface encourages users to click a prominent &quot;Play&quot; button to start their adventure.
            </p>
            <h2 className="text-2xl font-bold mb-4">Behind the Scenes</h2>
            <div className="mb-6">
                <div className="mb-6">
                    <strong>Typography and Layout</strong>
                    <div className="pl-4">
                        <p>The <code>fonts.ts</code> file imports custom fonts from Google, ensuring the text is both stylish and readable.</p>
                        <p>The <code>layout.tsx</code> file sets the structure for the app, applying the Inter font globally and defining metadata for the website.</p>
                    </div>
                </div>
                <div className="mb-6">
                    <strong>Home Page</strong>
                    <div className="pl-4">
                        <p>In <code>page.tsx</code>, the homepage is configured. It sets up AWS Amplify for backend services and uses Framer Motion for animations. Users see a fading background image and animated buttons, enhancing the visual appeal.</p>
                    </div>
                </div>
                <div className="mb-6">
                    <strong>Styling</strong>
                    <div className="pl-4">
                        <p>The <code>globals.css</code> file uses Tailwind CSS to style the application, ensuring a consistent look and feel across all pages. It defines various utility classes for the overall aesthetic.</p>
                    </div>
                </div>
                <div className="mb-6">
                    <strong>AI Services</strong>
                    <div className="pl-4">
                        <p><strong>Image Generation:</strong> <code>route.ts</code> in the <code>image</code> API directory handles requests to OpenAI&apos;s API to generate images based on user prompts. This feature allows the creation of vivid and contextually relevant visuals for the stories.</p>
                        <p><strong>Audio Generation:</strong> Similarly, <code>route.ts</code> in the <code>audio</code> API directory manages requests to generate text-to-speech audio, providing an auditory dimension to the storytelling experience.</p>
                        <p><strong>Chat Completion:</strong> The <code>primary</code> route files handle generating narrative content and responses using OpenAI&apos;s models, ensuring the story progresses naturally based on user interactions.</p>
                    </div>
                </div>
                <div className="mb-6">
                    <strong>Game Logic</strong>
                    <div className="pl-4">
                        <p><strong>Game Settings:</strong> <code>gameSettings.ts</code> and <code>genreSettings.ts</code> define the settings for different story genres, ensuring each story has unique characteristics and settings tailored to its genre.</p>
                        <p><strong>Play Page:</strong> <code>page.tsx</code> in the <code>play</code> directory manages the game&apos;s main interface, allowing users to interact with the story, make choices, and experience the consequences of their actions.</p>
                        <p><strong>Game Engine:</strong> <code>useGameEngine.ts</code> hooks manage the game&apos;s state, including fetching scenes, handling player actions, and updating the UI accordingly.</p>
                    </div>
                </div>
                <div className="mb-6">
                    <strong>Context Providers</strong>
                    <div className="pl-4">
                        <p><strong>AuthContext:</strong> Manages user authentication, ensuring only logged-in users can access and interact with their stories.</p>
                        <p><strong>MessagingContext:</strong> Handles in-game messaging, ensuring smooth communication and interaction within the game environment.</p>
                    </div>
                </div>
            </div>
            <p>
                The application leverages AWS Amplify for backend services, including authentication and data storage, ensuring a seamless and secure user experience. By integrating various AI services, &quot;Grow a Tale&quot; provides a rich, multimedia storytelling experience that adapts to user inputs, making each journey unique and engaging.
            </p>
        </div>
    );
}
