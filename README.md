# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Vite](https://img.shields.io/badge/Vite-5.x-purple?logo=vite)](https://vitejs.dev/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/)

A visually appealing and highly functional web portal for exploring the vast collection of the Internet Archive. It combines a modern user interface with powerful discovery tools, personal research areas, and AI-powered analysis features.

## About AI Studio

This application was built and is hosted in **AI Studio**, a powerful web-based development environment designed for rapid prototyping and building AI-integrated applications.

AI Studio provides a seamless workflow from idea to deployment. It allows developers to write, edit, and manage code, dependencies, and environment variables, all within the browser. Its core strength lies in its ability to facilitate quick iterations, making it the perfect platform for projects like the Internet Archive Explorer, where experimentation with UI/UX and integration with powerful APIs like Google's Gemini is key.

**[Explore and fork this project in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

By opening the link above, you can access the complete source code, experiment with changes, and even deploy your own version of this application. It's an excellent way to see how modern web applications are built and to learn more about integrating AI capabilities.

---
## Table of Contents
- [Key Features](#key-features)
  - [Discovery & Exploration](#discovery--exploration)
  - [Community & Contribution](#community--contribution)
  - [Favorites & Curation](#favorites--curation)
  - [Research & Analysis (Scriptorium)](#research--analysis-scriptorium)
  - [Customization & Power-User Features](#customization--power-user-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [License](#license)


## Key Features

This application is more than just a search interface; it's a feature-rich portal for discovering the vast collection of the Internet Archive.

### Discovery & Exploration
-   **Dynamic Explorer Hub**: The main landing page offers a rich discovery experience when not searching, featuring carousels for "Trending Now" items and historical content from "On This Day".
-   **Curated Content Hubs**: Specialized sections for a focused browsing experience:
    -   **Videothek**: Browse classic films, film noir, and sci-fi in engaging, scrollable carousels.
    -   **Audiothek**: Discover live music, old-time radio shows, and audiobooks.
    -   **Images Hub**: Explore historical photos, art from museums like The Met, and scientific images from NASA.
    -   **Rec Room**: Play thousands of classic MS-DOS games and software directly in the browser via emulation.
-   **Universal Search & Filtering**: A persistent header search bar for quick queries, coupled with powerful capabilities to filter results by media type, year range, collection, and more.

### Community & Contribution
-   **Uploader Hub**: A dedicated section to discover the people and institutions behind the archives. Browse a curated list of featured uploaders or filter all known contributors by category (Archivist, Institution, Music, etc.).
-   **Detailed Uploader Profiles**: Every uploader and creator has a dynamic profile page.
    -   **Dynamic Tabs**: The profile is organized into tabs that appear only if the user has that type of content: **Uploads, Collections, Favorites, Reviews, Forum Posts,** and **Web Archives**.
    -   **Interactive Uploads Tab**: The main uploads list features an integrated control panel for real-time filtering by media type and sorting by popularity, date published, and more.

### Favorites & Curation
-   **Unified Library ("My Library")**: A central hub for all your saved content, organized into three sections:
    -   **Items**: Manage your saved items with an advanced interface that includes searching, filtering by media type, and sorting by title or date added.
    -   **Bulk Management**: A "Select Mode" allows you to select multiple items at once for bulk deletion.
    -   **Uploaders**: View and search through all the contributors you follow.
    -   **Collections**: A placeholder for future functionality to save entire collections.

### Research & Analysis (Scriptorium)
-   **Personal Worksets**: A personal workspace for text-based research. Group documents from the archive into "worksets" to organize your projects.
-   **Integrated Reader & AI Tools**: The Scriptorium features a built-in document reader with powerful tools powered by the **Google Gemini API**:
    -   **AI Summarization**: Generate concise summaries of lengthy texts on demand.
    -   **Entity Extraction**: Automatically identify and tag people, places, organizations, and dates in texts to fuel further discovery.
    -   **Persistent Notes**: Write and save personal notes for each document within a workset.

### Customization & Power-User Features
-   **Comprehensive Settings**: A detailed settings page to tailor the experience, including theme (Light/Dark/System), language (English/German), results per page, UI appearance, and AI behavior.
-   **Command Palette (Cmd/Ctrl + K)**: A power-user feature for instant navigation to any section, changing settings, or performing actions with just a few keystrokes.
-   **Data Management**: Easily export and import all your user data (settings, favorites, worksets) as a single JSON file for backup and migration.
-   **Modern UI/UX**: Fully responsive for all screen sizes, accessible design with ARIA attributes, and smooth animations (with a reduce motion option).


## Tech Stack

-   **Frontend**: [React 19](https://react.dev/) with Hooks
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) for atomic, performant global state.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
-   **AI**: [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
-   **Build Tool**: [Vite](https://vitejs.dev/) for fast and optimized development and builds.
-   **Internationalization**: Custom hook-based solution for loading namespaced JSON translation files.

## Project Structure

The project is organized into logical directories for easy navigation:

-   `/components`: Reusable React components (e.g., `ItemCard`, `Header`, `Spinner`).
-   `/contexts`: React Context providers for cross-cutting concerns (e.g., `ToastContext`).
-   `/hooks`: Custom React hooks for shared logic (e.g., `useDebounce`, `useInfiniteScroll`, `useNavigation`).
-   `/pages`: Top-level view components that represent a full page or main view (e.g., `ExplorerView`, `UploaderHubView`).
-   `/services`: Modules for interacting with external APIs (`archiveService.ts`, `geminiService.ts`).
-   `/store`: Jotai atom definitions, organized by feature slice, for global state management.
-   `/utils`: Helper functions for formatting, query building, etc.
-   `/locales`: Contains language subdirectories (`/en`, `/de`) with JSON files for internationalization.

## Environment Variables

To use the AI-powered features, you must provide a Google Gemini API key.

-   `API_KEY`: Your Google Gemini API key.

This key is expected to be available as an environment variable in the execution context where the application is run (like AI Studio's secrets manager).

## License

This project is licensed under the MIT License.
