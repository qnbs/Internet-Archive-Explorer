# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/)

A visually appealing and highly functional web application to browse, view, and discover content from the Internet Archive, enhanced with AI-powered features.

## About AI Studio

This application was built and is hosted in **AI Studio**, a powerful web-based development environment designed for rapid prototyping and building AI-integrated applications.

AI Studio provides a seamless workflow from idea to deployment. It allows developers to write, edit, and manage code, dependencies, and environment variables, all within the browser. Its core strength lies in its ability to facilitate quick iterations, making it the perfect platform for projects like the Internet Archive Explorer, where experimentation with UI/UX and integration with powerful APIs like Google's Gemini is key.

**[Explore and fork this project in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

By opening the link above, you can access the complete source code, experiment with changes, and even deploy your own version of this application. It's an excellent way to see how modern web applications are built and to learn more about integrating AI capabilities.

---

## Key Features

This application is more than just a search interface; it's a feature-rich portal for discovering the vast collection of the Internet Archive.

-   **Universal Search & Advanced Filtering**: A persistent header search bar for quick queries, coupled with a powerful advanced search popover to filter by media type, year range, collection, and specific metadata fields.
-   **Curated Hubs**: Specialized landing pages for a rich discovery experience:
    -   **Cinematheque**: For browsing classic films, film noir, sci-fi, and more.
    -   **Audiothek**: For discovering live music, old-time radio, and audiobooks.
    -   **Images Hub**: For exploring historical photos, art from museums like The Met, and scientific images from NASA.
    -   **Rec Room**: For playing thousands of classic MS-DOS games and software directly in the browser via emulation.
-   **Uploader Hub & Profiles**: Discover the people and institutions behind the archives. Browse featured uploaders, filter by category, and view detailed profiles with their complete upload history.
-   **Favorites System**: Save your favorite items and uploaders for easy access later. All data is stored locally in your browser.
-   **Scriptorium for Research**: A personal workspace for text-based research. Group documents into "worksets," write notes, and use AI tools for analysis.
-   **AI-Powered by Gemini**:
    -   **AI Summarization**: Generate concise summaries of text documents.
    -   **Entity Extraction**: Automatically identify and tag people, places, organizations, and dates in texts.
-   **Wayback Machine Integration**: Explore the history of websites by viewing archived snapshots over time.
-   **Command Palette (Cmd/Ctrl + K)**: A power-user feature for instant navigation to any section, changing settings, or jumping directly to an uploader's profile.
-   **Modern UI/UX**:
    -   Responsive design for desktop, tablet, and mobile.
    -   Theming (Light/Dark/System).
    -   Internationalization (English & German).
    -   Smooth animations and transitions for a polished feel.

## Tech Stack

-   **Frontend**: [React 19](https://react.dev/) with Hooks
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI**: [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK
-   **Internationalization**: `react-i18next`

## Project Structure

The project is organized into logical directories for easy navigation:

-   `/components`: Reusable React components (e.g., `ItemCard`, `Header`, `Spinner`).
-   `/contexts`: React Context providers for managing global state (e.g., `SearchContext`, `ThemeContext`).
-   `/hooks`: Custom React hooks for shared logic (e.g., `useDebounce`, `useInfiniteScroll`).
-   `/pages`: Top-level view components that represent a full page or main view (e.g., `ExplorerView`, `UploaderHubView`).
-   `/services`: Modules for interacting with external APIs (`archiveService.ts`, `geminiService.ts`).
-   `en.json`, `de.json`: Language files for internationalization.

## Environment Variables

To use the AI-powered features, you must provide a Google Gemini API key.

-   `API_KEY`: Your Google Gemini API key.

This key is expected to be available as an environment variable in the execution context where the application is run (like AI Studio's secrets manager).

## License

This project is licensed under the MIT License.
