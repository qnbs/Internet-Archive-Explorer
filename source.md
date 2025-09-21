# Internet Archive Explorer: Source Code Documentation (Part 1 of 2)

This document contains the foundational code for the Internet Archive Explorer application. It includes the main HTML entrypoint, core application logic, configuration files, type definitions, and service modules responsible for all external API communication.

## Full Directory Structure

```
/
├── App.tsx
├── README.md
├── components/
│   ├── AIToolsTab.tsx
│   ├── AIInsightPanel.tsx
│   ├── AILoadingIndicator.tsx
│   ├── ArchivalCarousel.tsx
│   ├── BookReaderModal.tsx
│   ├── BottomNav.tsx
│   ├── CarouselItemCard.tsx
│   ├── CommandPalette.tsx
│   ├── ConfirmationModal.tsx
│   ├── ContentCarousel.tsx
│   ├── DonutChart.tsx
│   ├── EmulatorModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── Header.tsx
│   ├── Icons.tsx
│   ├── ImageDetailModal.tsx
│   ├── ItemCard.tsx
│   ├── ItemDetailDescriptionTab.tsx
│   ├── ItemDetailFilesTab.tsx
│   ├── ItemDetailModal.tsx
│   ├── ItemDetailRelatedTab.tsx
│   ├── ItemDetailSidebar.tsx
│   ├── ItemDetailTabs.tsx
│   ├── ModalManager.tsx
│   ├── OnThisDay.tsx
│   ├── PWAInstallButton.tsx
│   ├── RecRoomItemCard.tsx
│   ├── RelatedItems.tsx
│   ├── ResultsGrid.tsx
│   ├── ReviewCard.tsx
│   ├── RichTextEditor.tsx
│   ├── SearchBar.tsx
│   ├── SearchPopover.tsx
│   ├── SideMenu.tsx
│   ├── SkeletonCard.tsx
│   ├── Spinner.tsx
│   ├── Toast.tsx
│   ├── UploaderProfileCard.tsx
│   ├── ai-archive/
│   │   ├── AIArchiveDetailPane.tsx
│   │   ├── AIArchiveDetailModal.tsx
│   │   ├── AIArchiveItemCard.tsx
│   │   ├── AIArchiveList.tsx
│   │   ├── AIArchiveSidebar.tsx
│   │   └── SourceItemCard.tsx
│   ├── audiothek/
│   │   ├── AudiothekHero.tsx
│   │   └── CategoryGrid.tsx
│   ├── favorites/
│   │   └── FavoriteItemCard.tsx
│   │   └── UploaderFavoritesTab.tsx
│   ├── library/
│   │   ├── AddToCollectionModal.tsx
│   │   ├── AddTagsModal.tsx
│   │   ├── LibraryDetailPane.tsx
│   │   ├── LibraryItemList.tsx
│   │   ├── LibrarySidebar.tsx
│   │   ├── MagicOrganizeModal.tsx
│   │   └── NewCollectionModal.tsx
│   ├── scriptorium/
│   │   ├── AddDocumentModal.tsx
│   │   ├── AnalysisPane.tsx
│   │   ├── AnalysisToolbar.tsx
│   │   ├── AskAIModal.tsx
│   │   ├── DocumentListItem.tsx
│   │   ├── DocumentReader.tsx
│   │   ├── DocumentSearchBar.tsx
│   │   ├── ResizablePanel.tsx
│   │   ├── ScriptoriumHub.tsx
│   │   ├── WorksetListItem.tsx
│   │   └── WorkspacePanel.tsx
│   ├── settings/
│   │   └── ThemeSelector.tsx
│   ├── uploader/
│   │   ├── UploaderCollections.tsx
│   │   ├── UploaderFavorites.tsx
│   │   ├── UploaderHeader.tsx
│   │   ├── UploaderHubSidebar.tsx
│   │   ├── UploaderPostsTab.tsx
│   │   ├── UploaderReviewsTab.tsx
│   │   ├── UploaderSidebar.tsx
│   │   ├── UploaderWebArchiveTab.tsx
│   │   └── UploadsFilterControls.tsx
│   └── videothek/
│       ├── CollectionCarousel.tsx
│       └── HeroSection.tsx
├── contexts/
│   └── ToastContext.tsx
├── hooks/
│   ├── useArchivalItems.ts
│   ├── useCommands.ts
│   ├── useDebounce.ts
│   ├── useExplorerSearch.ts
│   ├── useImageViewer.ts
│   ├── useInfiniteScroll.ts
│   ├── useItemMetadata.ts
│   ├── useLanguage.ts
│   ├── useModalFocusTrap.ts
│   ├── useNavigation.ts
│   ├── useSearchAndGo.ts
│   ├── useUploaderStats.ts
│   ├── useUploaderTabCounts.ts
│   ├── useUploaderUploads.ts
│   └── useWorksets.ts
├── icon-192.svg
├── icon-512.svg
├── index.html
├── index.tsx
├── locales/
│   ├── de/
│   └── en/
├── manifest.json
├── metadata.json
├── package.json
├── pages/
│   ├── AIArchiveView.tsx
│   ├── AudiothekView.tsx
│   ├── CategoryView.tsx
│   ├── ExplorerView.tsx
│   ├── HelpView.tsx
│   ├── ImagesHubView.tsx
│   ├── LibraryView.tsx
│   ├── MyArchiveView.tsx
│   ├── RecRoomView.tsx
│   ├── ScriptoriumView.tsx
│   ├── SettingsView.tsx
│   ├── StorytellerView.tsx
│   ├── UploaderDetailView.tsx
│   ├── UploaderHubView.tsx
│   ├── VideothekView.tsx
│   ├── WebArchiveView.tsx
│   ├── categoryContent.ts
│   └── uploaderData.ts
├── services/
│   ├── aiPersistenceService.ts
│   ├── archiveService.ts
│   ├── cacheService.ts
│   ├── dataService.ts
│   └── geminiService.ts
├── store/
│   ├── aiArchive.ts
│   ├── app.ts
│   ├── archive.ts
│   ├── atoms.ts
│   ├── favorites.ts
│   ├── i18n.ts
│   ├── index.ts
│   ├── safeStorage.ts
│   ├── scriptorium.ts
│   ├── search.ts
│   ├── settings.ts
│   └── toast.ts
├── sw.js
├── types.ts
├── utils/
│   ├── formatter.ts
│   ├── imageUtils.ts
│   ├── profileUtils.ts
│   ├── queryBuilder.ts
│   └── sanitizer.ts
└── vite.config.js
```

---

## Part 1: Project Overview & Configuration

### `/README.md`
```markdown
# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

**An advanced, production-ready web portal for exploring the vast collection of the Internet Archive.** This application combines a modern, responsive user interface with powerful discovery tools, personal research spaces, and a deep, multi-faceted integration of the Google Gemini AI for analysis and content generation. It is a fully-featured Progressive Web App (PWA), enabling installation and offline access.

### Live Demo & Code in AI Studio

This application was developed and is hosted in **AI Studio**, a powerful web-based development environment for prototyping and building AI-integrated applications.

**[Explore and fork this project in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Via the link above, you can access the full source code, experiment with changes, and even deploy your own version of this application.

---

## Table of Contents
- [Core Features](#core-features)
  - [Unified Discovery Engine](#unified-discovery-engine)
  - [Curated Content Hubs](#curated-content-hubs)
  - [My Archive & Contributor Profiles](#my-archive--contributor-profiles)
  - [My Library: A Personal Curation Space](#my-library-a-personal-curation-space)
  - [The Scriptorium: A Researcher's Workspace](#the-scriptorium-a-researchers-workspace)
  - [AI Archive: Your Personal AI Memory](#ai-archive-your-personal-ai-memory)
- [Comprehensive AI Integration (Gemini)](#comprehensive-ai-integration-gemini)
- [Power-User Tools & PWA](#power-user-tools--pwa)
- [Technical Deep-Dive](#technical-deep-dive)
  - [Technology Stack](#technology-stack)
  - [State Management (Why Jotai?)](#state-management-why-jotai)
  - [Performance & PWA](#performance--pwa)
  - [Accessibility (A11y) & Internationalization (i18n)](#accessibility-a11y--internationalization-i18n)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [License](#license)

---

## Core Features

### Unified Discovery Engine
-   **Dynamic Explorer Hub**: The main page offers a rich discovery experience with carousels for "Trending Now" and historical "On This Day" content.
-   **Universal Search**: A persistent header search bar allows for quick queries from any part of the application.
-   **Advanced Filtering**: Precisely refine search results by media type, language, and content availability (free vs. borrowable).

### Curated Content Hubs
Specialized sections for a focused browsing experience, each with a unique, AI-generated creative insight:
-   **Videothek**: Browse classic movies, film noir, and sci-fi.
-   **Audiothek**: Discover live music, old-time radio shows, and audiobooks.
-   **Images Hub**: Explore historical photos, art from museums like The Met, and scientific imagery from NASA.
-   **Rec Room**: Play thousands of classic MS-DOS games and software directly in the browser via emulation.
-   **Web Archive**: A dedicated interface for querying the Wayback Machine for archived websites.
-   **Storyteller**: An interactive, AI-powered tool that generates unique short stories based on your prompts.

### My Archive & Contributor Profiles
-   **Unified Profile Engine**: The application features a single, powerful profile view that serves two purposes. It can display the public profile of any contributor on the Internet Archive, or it can function as a personal dashboard for your own account.
-   **My Archive Dashboard**: Connect your public Internet Archive screen name to use the profile view as a personal dashboard for your own contributions, stats, and activity. The connection is verified using your public uploads and is stored locally.
-   **Dynamic Content Tabs**: Each profile is a dynamic dashboard of the contributor's activity. Tabs for **Uploads, Collections, Favorites, Reviews, Forum Posts,** and **Web Archives** automatically appear only if the user has content in that category.
-   **Powerful Upload Filtering**: The main "Uploads" tab is an interactive archive in its own right, featuring a built-in control panel to filter all of a contributor's uploads by media type and sort by criteria like popularity or publication date.

### My Library: A Personal Curation Space
A central hub for all your saved items and followed contributors, organized in a three-pane layout for desktop:
-   **Collections & Tags**: Organize saved items into custom collections or filter them by user-defined tags.
-   **Item List & Bulk Actions**: Manage saved items with search and sorting. A "Select Mode" allows for batch-selecting items to add them to collections, add tags, delete them, or use "Magic Organize."
-   **Detail Pane & Notes**: View details of a selected item, write and save personal Markdown-enabled notes, and manage tags without leaving the library view.

### The Scriptorium: A Researcher's Workspace
-   **Personal Worksets**: A personal workspace for text-based research. Group documents from the archive into "Worksets" to organize your projects.
-   **Integrated Reader & AI Tools**: The Scriptorium features a two-panel resizable view with an integrated document reader and a simple text editor for notes. It's enhanced with powerful AI tools.
-   **Persistent Notes**: Write and save personal notes for each document within a workset, with changes autosaved.

### AI Archive: Your Personal AI Memory
-   **Automatic Caching**: Every interaction with the AI—from summaries and insights to image analyses and stories—can be automatically saved to a dedicated AI Archive.
-   **Browse & Filter**: The AI Archive is a fully-featured section where you can browse, search, and filter all your past AI generations by type, language, or tags.
-   **Detailed View**: Select any archived entry to see the full generated content, the source item(s) that prompted it, and add your own personal notes and tags for organization.

---

## Comprehensive AI Integration (Gemini)

The app leverages the Google Gemini API for a wide range of analytical and creative tasks:

#### Text Analysis (Scriptorium & Item Details)
-   **AI Summarization**: On-demand, generate concise summaries of long texts with adjustable tones (simple, detailed, or academic).
-   **Entity Extraction**: Automatically identify and tag people, places, organizations, and dates within texts.
-   **Contextual Q&A**: Ask questions about a document and receive answers based solely on the provided text.

#### Image Analysis (Image Viewer)
-   **Automated Description & Tagging**: Generate a detailed, objective description and a list of relevant search tags for any image.
-   **Multi-turn Q&A**: After an initial analysis, engage in a conversation by asking follow-up questions about the image to get more specific details.

#### Curation & Organization (My Library)
-   **Magic Organization**: Select multiple items in your library and get AI suggestions for relevant tags and new collection names to automatically organize them.

#### Creative Content Generation (Hubs)
-   **Daily Historical Insight (Explorer)**: Generates a short, plausible historical event that creatively connects the day's trending items.
-   **Double Feature Concept (Videothek)**: Invents a themed "double feature" night, complete with a catchy title, based on a list of films.
-   **Radio Show Concept (Audiothek)**: Creates a concept for a fictional radio show episode, with a title and theme, based on a list of audio items.
-   **Museum Exhibit Concept (Images Hub)**: Designs a mini gallery exhibition, with a creative title and description, connecting a set of images.
-   **Retro Gaming Note (Rec Room)**: Writes a nostalgic "editor's note" for a fictional gaming magazine based on a list of classic games.
-   **Storyteller**: Generates original short stories from user prompts.

---

## Power-User Tools & PWA

-   **Command Palette (Cmd/Ctrl + K)**: Instantly navigate to any section, toggle settings, or perform actions with a few keystrokes.
-   **Advanced Image Viewer**: A fully-featured, in-modal image viewer with smooth zoom (mouse-wheel controlled), panning, rotation, fullscreen mode, and direct download capabilities, all controllable via keyboard shortcuts.
-   **Data Management**: Export and import all your user data (settings, library, worksets, AI archive) as a single JSON file for backup and migration.
-   **Progressive Web App (PWA)**: The application is fully PWA-compliant.
    -   **Installable**: Can be installed on desktop and mobile devices for an app-like experience.
    -   **Offline Capable**: The service worker caches all static assets and API calls, allowing for offline browsing of previously visited content.

---

## Technical Deep-Dive

### Technology Stack
-   **Frontend**: [React 19](https://react.dev/) with Hooks
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) for atomic, performant global state.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
-   **AI**: [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
-   **Build Tool**: [Vite](https://vitejs.dev/)

### State Management (Why Jotai?)
Jotai was chosen for its atomic approach. This allows for highly optimized re-renders, as components subscribe only to the specific atoms of state they need. This prevents the "waterfall" re-render problem common in context-based state management and results in significantly better performance in a complex, multi-paneled application like this. The use of `safeAtomWithStorage` provides robust persistence to `localStorage`, gracefully handling potential data corruption without crashing the app.

### Performance & PWA
-   **Code Splitting**: Each main view is split into its own chunk using `React.lazy` to ensure a fast initial page load.
-   **Debouncing & Throttling**: User inputs are debounced to prevent excessive API calls, and UI updates are managed to feel responsive.
-   **Infinite Scrolling**: `useInfiniteScroll` provides a smooth experience when browsing long lists of results by fetching more data just before the user reaches the end of the list.
-   **Memoization**: `React.memo`, `useCallback`, and `useMemo` are used strategically to prevent unnecessary component re-renders.
-   **Service Worker**: A robust service worker (`sw.js`) provides offline functionality using a network-first strategy for API calls and a cache-first strategy for static assets.

### Accessibility (A11y) & Internationalization (i18n)
-   **Semantic HTML & ARIA**: Proper use of ARIA roles and attributes throughout the application, especially for modals, tabs, and interactive elements.
-   **Focus Management**: The `useModalFocusTrap` hook correctly traps focus within all modals, ensuring keyboard accessibility.
-   **User Settings**: Includes options like "Reduce Motion," "High Contrast Mode," and adjustable font sizes.
-   **Full Internationalization**: The entire application is translated into English and German, managed through a system of JSON files loaded on demand based on user preference.

## Getting Started
The easiest way to run this application is directly in AI Studio via the link provided at the top.

### Environment Variables
To use the AI-powered features, you must provide a Google Gemini API key.
-   `API_KEY`: Your Google Gemini API Key.

This key is expected as an environment variable in the execution context (e.g., AI Studio's secrets manager).

## Project Structure
-   `/components`: Reusable React components, organized by feature (e.g., `/library`, `/scriptorium`).
-   `/contexts`: React Context providers (e.g., `ToastContext`).
-   `/hooks`: Custom React hooks for shared logic (e.g., `useDebounce`, `useInfiniteScroll`).
-   `/pages`: Top-level components that represent a full page or main view.
-   `/services`: Modules for interacting with external APIs (`archiveService.ts`, `geminiService.ts`).
-   `/store`: Jotai atom definitions, organized by feature-slice.
-   `/utils`: Utility functions for formatting, query building, etc.
-   `/locales`: Contains language subdirectories (`/en`, `/de`) with JSON files for internationalization.

## License
This project is licensed under the MIT License.

---
<br>
<hr>
<br>

# Internet Archive Explorer (Deutsch)

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

**Ein hochentwickeltes, produktionsreifes Webportal zur Erkundung der riesigen Sammlung des Internet Archive.** Diese Anwendung kombiniert eine moderne, reaktionsschnelle Benutzeroberfläche mit leistungsstarken Entdeckungswerkzeugen, persönlichen Forschungsbereichen und einer tiefen, vielschichtigen Integration der Google Gemini KI für Analyse und Inhaltserstellung. Es ist eine voll funktionsfähige Progressive Web App (PWA), die Installation und Offline-Zugriff ermöglicht.

### Live-Demo & Code in AI Studio

Diese Anwendung wurde in **AI Studio** entwickelt und wird dort gehostet, einer leistungsstarken webbasierten Entwicklungsumgebung für das Prototyping und die Erstellung von KI-integrierten Anwendungen.

**[Entdecken und forken Sie dieses Projekt in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Über den obigen Link können Sie auf den vollständigen Quellcode zugreifen, mit Änderungen experimentieren und sogar Ihre eigene Version dieser Anwendung bereitstellen.

---

## Inhaltsverzeichnis (Deutsch)
- [Kernfunktionen](#kernfunktionen-de)
  - [Einheitliche Entdeckungs-Engine](#einheitliche-entdeckungs-engine-de)
  - [Kuratierte Inhalts-Hubs](#kuratierte-inhalts-hubs-de)
  - [Mein Archiv & Mitwirkenden-Profile](#mein-archiv--mitwirkenden-profile-de)
  - [Meine Bibliothek: Ein persönlicher Kurationsraum](#meine-bibliothek-ein-persönlicher-kurationsraum-de)
  - [Das Scriptorium: Ein Arbeitsbereich für Forschende](#das-scriptorium-ein-arbeitsbereich-für-forschende-de)
  - [KI-Archiv: Ihr persönliches KI-Gedächtnis](#ki-archiv-ihr-persönliches-ki-gedächtnis-de)
- [Umfassende KI-Integration (Gemini)](#umfassende-ki-integration-gemini-de)
- [Power-User-Tools & PWA](#power-user-tools--pwa-de)
- [Technischer Einblick](#technischer-einblick-de)
  - [Technologie-Stack](#technologie-stack-de)
  - [State Management (Warum Jotai?)](#state-management-warum-jotai-de)
  - [Performance & PWA](#performance--pwa-de)
  - [Barrierefreiheit (A11y) & Internationalisierung (i18n)](#barrierefreiheit-a11y--internationalisierung-i18n-de)
- [Erste Schritte](#erste-schritte-de)
- [Projektstruktur](#projektstruktur-de)
- [Lizenz](#lizenz-de)

---

## <a name="kernfunktionen-de"></a>Kernfunktionen

### <a name="einheitliche-entdeckungs-engine-de"></a>Einheitliche Entdeckungs-Engine
-   **Dynamischer Explorer-Hub**: Die Hauptseite bietet ein reichhaltiges Entdeckungserlebnis mit Karussells für "Aktuelle Trends" und historische Inhalte von "An diesem Tag".
-   **Universelle Suche**: Eine persistente Suchleiste im Header ermöglicht schnelle Abfragen von jeder Seite der Anwendung aus.
-   **Erweiterte Filterung**: Verfeinern Sie die Suchergebnisse präzise nach Medientyp, Sprache und Verfügbarkeit (frei vs. ausleihbar).

### <a name="kuratierte-inhalts-hubs-de"></a>Kuratierte Inhalts-Hubs
Spezialisierte Bereiche für ein fokussiertes Browsing-Erlebnis, jeder mit einem einzigartigen, KI-generierten kreativen Einblick:
-   **Videothek**: Durchsuchen Sie klassische Filme, Film Noir und Science-Fiction.
-   **Audiothek**: Entdecken Sie Live-Musik, alte Radiosendungen und Hörbücher.
-   **Bilder-Hub**: Erkunden Sie historische Fotos, Kunst von Museen wie dem Met und wissenschaftliche Bilder der NASA.
-   **Rec Room**: Spielen Sie Tausende von klassischen MS-DOS-Spielen und Software direkt im Browser per Emulation.
-   **Web-Archiv**: Eine dedizierte Oberfläche zur Abfrage der Wayback Machine für archivierte Websites.
-   **Storyteller**: Ein interaktives, KI-gestütztes Tool, das auf der Grundlage Ihrer Eingaben einzigartige Kurzgeschichten erstellt.

### <a name="mein-archiv--mitwirkenden-profile-de"></a>Mein Archiv & Mitwirkenden-Profile
-   **Einheitliche Profil-Engine**: Die Anwendung verfügt über eine einzige, leistungsstarke Profilansicht, die zwei Zwecken dient. Sie kann das öffentliche Profil eines jeden Mitwirkenden im Internet Archive anzeigen oder als persönliches Dashboard für Ihr eigenes Konto fungieren.
-   **Mein Archiv-Dashboard**: Verbinden Sie Ihren öffentlichen Internet-Archive-Anzeigenamen, um die Profilansicht als persönliches Dashboard für Ihre eigenen Beiträge, Statistiken und Aktivitäten zu nutzen. Die Verbindung wird anhand Ihrer öffentlichen Uploads überprüft und lokal gespeichert.
-   **Dynamische Inhalts-Tabs**: Jedes Profil ist ein dynamisches Dashboard der Aktivitäten des Mitwirkenden. Tabs für **Uploads, Sammlungen, Favoriten, Rezensionen, Forenbeiträge** und **Web-Archive** erscheinen automatisch nur dann, wenn der Benutzer Inhalte in dieser Kategorie hat.
-   **Leistungsstarke Upload-Filterung**: Der Haupt-Tab "Uploads" ist ein interaktives Archiv für sich. Er verfügt über ein integriertes Bedienfeld, mit dem Sie alle Uploads eines Mitwirkenden nach Medientyp filtern und nach Kriterien wie Beliebtheit oder Veröffentlichungsdatum sortieren können.

### <a name="meine-bibliothek-ein-persönlicher-kurationsraum-de"></a>Meine Bibliothek: Ein persönlicher Kurationsraum
Ein zentraler Hub für alle Ihre gespeicherten Inhalte und Mitwirkenden, organisiert in einem Drei-Fenster-Layout für Desktops:
-   **Sammlungen & Tags**: Organisieren Sie gespeicherte Elemente in benutzerdefinierten Sammlungen oder filtern Sie sie nach benutzerdefinierten Tags.
-   **Gegenstandsliste & Massenaktionen**: Verwalten Sie gespeicherte Elemente mit Suche und Sortierung. Ein "Auswahlmodus" ermöglicht die gleichzeitige Auswahl mehrerer Elemente, um sie zu Sammlungen hinzuzufügen, Tags hinzuzufügen, sie zu löschen oder "Magisch Organisieren" zu verwenden.
-   **Detailansicht & Notizen**: Sehen Sie Details zu einem ausgewählten Element, schreiben und speichern Sie persönliche Notizen mit Markdown-Unterstützung und verwalten Sie Tags, ohne die Bibliotheksansicht zu verlassen.

### <a name="das-scriptorium-ein-arbeitsbereich-für-forschende-de"></a>Das Scriptorium: Ein Arbeitsbereich für Forschende
-   **Persönliche Worksets**: Ein persönlicher Arbeitsbereich für textbasierte Forschung. Gruppieren Sie Dokumente aus dem Archiv in "Worksets", um Ihre Projekte zu organisieren.
-   **Integrierter Reader & KI-Tools**: Das Scriptorium verfügt über eine zweigeteilte, anpassbare Ansicht mit einem integrierten Dokumentenleser und einem einfachen Texteditor für Notizen, erweitert um leistungsstarke KI-Werkzeuge.
-   **Persistente Notizen**: Schreiben und speichern Sie persönliche Notizen für jedes Dokument innerhalb eines Worksets, wobei Änderungen automatisch gespeichert werden.

### <a name="ki-archiv-ihr-persönliches-ki-gedächtnis-de"></a>KI-Archiv: Ihr persönliches KI-Gedächtnis
-   **Automatisches Caching**: Jede Interaktion mit der KI – von Zusammenfassungen und Einblicken bis hin zu Bildanalysen und Geschichten – kann automatisch in einem dedizierten KI-Archiv gespeichert werden.
-   **Durchsuchen & Filtern**: Das KI-Archiv ist ein voll ausgestatteter Bereich, in dem Sie alle Ihre vergangenen KI-Generierungen durchsuchen, suchen und nach Typ, Sprache oder Tags filtern können.
-   **Detailansicht**: Wählen Sie einen archivierten Eintrag aus, um den vollständigen generierten Inhalt, die Quelldatei(en), die ihn veranlasst haben, anzuzeigen und Ihre eigenen persönlichen Notizen und Tags zur Organisation hinzuzufügen.

---

## <a name="umfassende-ki-integration-gemini-de"></a>Umfassende KI-Integration (Gemini)

Die App nutzt die Google Gemini API für eine Vielzahl von analytischen und kreativen Aufgaben:

#### Textanalyse (Scriptorium & Eintragsdetails)
-   **KI-Zusammenfassung**: Generieren Sie auf Abruf prägnante Zusammenfassungen langer Texte mit einstellbaren Tonalitäten (einfach, detailliert oder akademisch).
-   **Entitätenextraktion**: Identifizieren und kennzeichnen Sie automatisch Personen, Orte, Organisationen und Daten in Texten.
-   **Kontextbezogene F&A**: Stellen Sie Fragen zu einem Dokument und erhalten Sie Antworten, die ausschließlich auf dem bereitgestellten Text basieren.

#### Bildanalyse (Bildbetrachter)
-   **Automatisierte Beschreibung & Tagging**: Generieren Sie eine detaillierte, objektive Beschreibung und eine Liste relevanter Such-Tags für jedes Bild.
-   **Multi-Turn-F&A**: Führen Sie nach einer ersten Analyse ein Gespräch, indem Sie Folgefragen zum Bild stellen, um spezifischere Details zu erhalten.

#### Kuration & Organisation (Meine Bibliothek)
-   **Magische Organisation**: Wählen Sie mehrere Elemente in Ihrer Bibliothek aus und erhalten Sie KI-Vorschläge für relevante Tags und neue Sammlungsnamen, um sie automatisch zu organisieren.

#### Kreative Inhaltserstellung (Hubs)
-   **Täglicher historischer Einblick (Explorer)**: Generiert ein kurzes, plausibles historisches Ereignis, das die Trend-Elemente des Tages kreativ verbindet.
-   **Double-Feature-Konzept (Videothek)**: Erfindet eine thematische "Double-Feature"-Nacht, komplett mit einem eingängigen Titel, basierend auf einer Liste von Filmen.
-   **Radiosendungs-Konzept (Audiothek)**: Erstellt ein Konzept für eine fiktive Radiosendungsepisode mit Titel und Thema, basierend auf einer Liste von Audio-Elementen.
-   **Museumsausstellungs-Konzept (Bilder-Hub)**: Entwirft eine kleine Galerieausstellung mit einem kreativen Titel und einer Beschreibung, die eine Reihe von Bildern verbindet.
--   **Retro-Gaming-Notiz (Rec Room)**: Schreibt eine nostalgische "Anmerkung des Herausgebers" für ein fiktives Gaming-Magazin, basierend auf einer Liste klassischer Spiele.
-   **Storyteller**: Generiert originelle Kurzgeschichten aus Benutzereingaben.

---

## <a name="power-user-tools--pwa-de"></a>Power-User-Tools & PWA

-   **Befehlspalette (Cmd/Ctrl + K)**: Navigieren Sie sofort zu jedem Bereich, ändern Sie Einstellungen oder führen Sie Aktionen mit nur wenigen Tastenanschlägen aus.
-   **Fortschrittlicher Bildbetrachter**: Ein voll ausgestatteter, in das Modal integrierter Bildbetrachter mit stufenlosem Zoom (per Mausrad), Schwenken, Rotation, Vollbildmodus und direkten Download-Möglichkeiten, alles per Tastaturkürzel steuerbar.
-   **Datenverwaltung**: Exportieren und importieren Sie alle Ihre Benutzerdaten (Einstellungen, Bibliothek, Worksets, KI-Archiv) als einzelne JSON-Datei zur Sicherung und Migration.
-   **Progressive Web App (PWA)**: Die Anwendung ist vollständig PWA-konform.
    -   **Installierbar**: Kann auf Desktop- und Mobilgeräten für ein App-ähnliches Erlebnis installiert werden.
    -   **Offline-fähig**: Der Service Worker speichert alle statischen Assets und API-Aufrufe zwischen, was das Offline-Durchsuchen von zuvor besuchten Inhalten ermöglicht.

---

## <a name="technischer-einblick-de"></a>Technischer Einblick

### <a name="technologie-stack-de"></a>Technologie-Stack
-   **Frontend**: [React 19](https://react.dev/) mit Hooks
-   **Sprache**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) für atomaren, performanten globalen Zustand.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) für ein Utility-First-CSS-Framework.
-   **KI**: [Google Gemini API](https://ai.google.dev/) über das `@google/genai` SDK.
-   **Build-Tool**: [Vite](https://vitejs.dev/)

### <a name="state-management-warum-jotai-de"></a>State Management (Warum Jotai?)
Jotai wurde aufgrund seines atomaren Ansatzes gewählt. Dies ermöglicht ein hochgradig optimiertes Rerendering, da Komponenten nur die spezifischen Zustandsatome abonnieren, die sie benötigen. Dies verhindert das "Wasserfall"-Rerendering-Problem, das bei kontextbasiertem State Management häufig auftritt, und führt zu einer deutlich besseren Leistung in einer komplexen, mehrteiligen Anwendung wie dieser. Die Verwendung von `safeAtomWithStorage` sorgt für eine robuste Persistenz im `localStorage`, die potenzielle Datenbeschädigungen ohne Absturz der App elegant handhabt.

### <a name="performance--pwa-de"></a>Performance & PWA
-   **Code Splitting**: Jede Hauptansicht wird mit `React.lazy` in einen eigenen Chunk aufgeteilt, um eine schnelle anfängliche Ladezeit zu gewährleisten.
-   **Debouncing & Throttling**: Benutzereingaben werden entprellt, um übermäßige API-Aufrufe zu verhindern, und UI-Updates werden so verwaltet, dass sie reaktionsschnell wirken.
-   **Infinite Scrolling**: `useInfiniteScroll` sorgt für ein reibungsloses Erlebnis beim Durchsuchen langer Ergebnislisten, indem mehr Daten abgerufen werden, kurz bevor der Benutzer das Ende der Liste erreicht.
-   **Memoization**: `React.memo`, `useCallback` und `useMemo` werden gezielt eingesetzt, um unnötige Rerenderings von Komponenten zu verhindern.
-   **Service Worker**: Ein robuster Service Worker (`sw.js`) bietet Offline-Funktionalität mit einer Network-First-Strategie für API-Aufrufe und einer Cache-First-Strategie für statische Assets.

### <a name="barrierefreiheit-a11y--internationalisierung-i18n-de"></a>Barrierefreiheit (A11y) & Internationalisierung (i18n)
-   **Semantisches HTML & ARIA**: Korrekte Verwendung von ARIA-Rollen und -Attributen in der gesamten Anwendung, insbesondere für Modals, Tabs und interaktive Elemente.
-   **Fokus-Management**: Der `useModalFocusTrap`-Hook fängt den Fokus korrekt in allen Modalfenstern ein und gewährleistet die Barrierefreiheit per Tastatur.
-   **Benutzereinstellungen**: Umfasst Optionen wie "Bewegung reduzieren", "Hochkontrastmodus" und anpassbare Schriftgrößen.
-   **Vollständige Internationalisierung**: Die gesamte Anwendung ist ins Englische und Deutsche übersetzt und wird über ein System von JSON-Dateien verwaltet, die je nach Benutzerpräferenz bei Bedarf geladen werden.

## <a name="erste-schritte-de"></a>Erste Schritte
Der einfachste Weg, diese Anwendung auszuführen, ist direkt in AI Studio über den oben angegebenen Link.

### Umgebungsvariablen
Um die KI-gestützten Funktionen nutzen zu können, müssen Sie einen Google Gemini API-Schlüssel angeben.
-   `API_KEY`: Ihr Google Gemini API-Schlüssel.

Dieser Schlüssel wird als Umgebungsvariable im Ausführungskontext erwartet (z. B. im Geheimnis-Manager von AI Studio).

## <a name="projektstruktur-de"></a>Projektstruktur
-   `/components`: Wiederverwendbare React-Komponenten, nach Funktion geordnet (z. B. `/library`, `/scriptorium`).
-   `/contexts`: React-Kontext-Provider (z. B. `ToastContext`).
-   `/hooks`: Benutzerdefinierte React-Hooks für gemeinsam genutzte Logik (z. B. `useDebounce`).
-   `/pages`: Komponenten auf oberster Ebene, die eine vollständige Seite oder Hauptansicht darstellen.
-   `/services`: Module für die Interaktion mit externen APIs (`archiveService.ts`, `geminiService.ts`).
-   `/store`: Jotai-Atom-Definitionen, nach Feature-Slice organisiert.
-   `/utils`: Hilfsfunktionen für Formatierung, Abfrageerstellung usw.
-   `/locales`: Enthält Sprachunterverzeichnisse (`/en`, `/de`) mit JSON-Dateien für die Internationalisierung.

## <a name="lizenz-de"></a>Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert.
```

### `/package.json`
```json
{
  "name": "internet-archive-explorer",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "@google/genai": "^1.19.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^5.0.2",
    "jotai": "^2.14.0",
    "typescript": "^5.5.4",
    "uuid": "^10.0.0",
    "vite": "^7.1.5"
  }
}
```

### `/vite.config.js`
```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
```

### `/metadata.json`
```json
{
  "name": "Internet Archive Explorer",
  "description": "A visually appealing and highly functional web application to browse, view, and discover content from the Internet Archive, enhanced with AI-powered summaries.",
  "requestFramePermissions": []
}
```

### `/manifest.json`
```json
{
  "name": "Internet Archive Explorer",
  "short_name": "IA Explorer",
  "description": "A visually appealing and highly functional web application to browse, view, and discover content from the Internet Archive, enhanced with AI-powered summaries.",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#083344",
  "theme_color": "#06b6d4",
  "icons": [
    {
      "src": "./icon-192.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    },
    {
      "src": "./icon-512.svg",
      "sizes": "512x512",
      "type": "image/svg+xml"
    }
  ]
}
```

---

## Part 2: Application Entrypoint & Core

### `/index.html`
```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Internet Archive Explorer</title>
    
    <link rel="manifest" href="./manifest.json" />
    <meta name="theme-color" content="#06b6d4" />
    <link rel="apple-touch-icon" href="./icon-192.svg">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <script type="importmap">
      {
        "imports": {
          "@google/genai": "https://aistudiocdn.com/@google/genai@^1.19.0",
          "react/": "https://aistudiocdn.com/react@^19.1.1/",
          "react": "https://aistudiocdn.com/react@^19.1.1",
          "jotai/": "https://aistudiocdn.com/jotai@^2.14.0/",
          "jotai": "https://aistudiocdn.com/jotai@^2.14.0",
          "uuid": "https://aistudiocdn.com/uuid@^13.0.0",
          "react-dom/": "https://aistudiocdn.com/react-dom@^19.1.1/",
          "vite": "https://aistudiocdn.com/vite@^7.1.5",
          "path": "https://aistudiocdn.com/path@^0.12.7",
          "@vitejs/plugin-react": "https://aistudiocdn.com/@vitejs/plugin-react@^5.0.2"
        }
      }
    </script>
    
    <script src="https://cdn.tailwindcss.com?plugins=typography,aspect-ratio"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              accent: {
                50: 'var(--color-accent-50)',
                100: 'var(--color-accent-100)',
                200: 'var(--color-accent-200)',
                300: 'var(--color-accent-300)',
                400: 'var(--color-accent-400)',
                500: 'var(--color-accent-500)',
                600: 'var(--color-accent-600)',
                700: 'var(--color-accent-700)',
                800: 'var(--color-accent-800)',
                900: 'var(--color-accent-900)',
                950: 'var(--color-accent-950)',
              },
            },
            fontFamily: {
              sans: ['Inter', 'sans-serif'],
            },
            boxShadow: {
              't-lg': '0 -10px 15px -3px rgb(0 0 0 / 0.1), 0 -4px 6px -4px rgb(0 0 0 / 0.1)',
            },
          }
        }
      }
    </script>
    
    <style type="text/tailwindcss">
        @layer base {
          :root {
            font-family: 'Inter', sans-serif;
            
            /* Default to Cyan */
            --color-accent-50: #ecfeff;
            --color-accent-100: #cffafe;
            --color-accent-200: #a5f3fd;
            --color-accent-300: #67e8f9;
            --color-accent-400: #22d3ee;
            --color-accent-500: #06b6d4;
            --color-accent-600: #0891b2;
            --color-accent-700: #0e7490;
            --color-accent-800: #155e75;
            --color-accent-900: #164e63;
            --color-accent-950: #083344;
          }
        }
        
        /* Custom animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out forwards; }
      
        @keyframes pageFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-page-fade-in { animation: pageFadeIn 0.4s ease-out forwards; }
        
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        .animate-fade-in-left { animation: fadeInLeft 0.3s ease-out forwards; }

        /* Styles for the rich text editor content */
        .prose-editor ul, .prose-editor ol {
          list-style-position: inside;
          padding-left: 1rem;
        }
        .prose-editor ul {
          list-style-type: disc;
        }
        .prose-editor ol {
          list-style-type: decimal;
        }
        .underline-links a {
            text-decoration: underline;
        }
        [contenteditable][data-placeholder]:empty:before {
            content: attr(data-placeholder);
            color: #6b7280; /* gray-500 */
            pointer-events: none;
            display: block;
        }
        /* Fix for contenteditable placeholder creating unwanted height */
        [contenteditable][data-placeholder]:empty {
            min-height: 0;
        }
        
        /* Accessibility: Disable animations based on user setting */
        .no-animations *,
        .no-animations *::before,
        .no-animations *::after {
          animation-delay: -1ms !important;
          animation-duration: 1ms !important;
          animation-iteration-count: 1 !important;
          background-attachment: initial !important;
          scroll-behavior: auto !important;
          transition-delay: 0s !important;
          transition-duration: 0s !important;
        }
    </style>
  </head>
  <body class="bg-gray-100 dark:bg-gray-900">
    <div id="root"></div>
    <script type="module" src="/index.tsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('./sw.js')
            .then(registration => {
              console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
              console.log('ServiceWorker registration failed: ', error);
            });
        });
      }
    </script>
  </body>
</html>
```

### `/index.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);
```

### `/App.tsx`
```tsx
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { 
    activeViewAtom, 
    modalAtom,
} from './store/app';
import {
    selectedProfileAtom,
    profileReturnViewAtom,
    toastAtom,
} from './store/atoms';
import { 
    resolvedThemeAtom, 
    disableAnimationsAtom,
    highContrastModeAtom,
    underlineLinksAtom,
    fontSizeAtom,
    scrollbarColorAtom,
    accentColorAtom,
    defaultViewAtom,
    defaultSettings,
} from './store/settings';
import type { View, Profile, ArchiveItemSummary, AccentColor, SelectItemHandler, ConfirmationOptions, MediaType, AppSettings } from './types';

// Providers & Contexts
import { ToastProvider, useToast } from './contexts/ToastContext';

// Layout Components
import { SideMenu } from './components/SideMenu';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import { ModalManager } from './components/ModalManager';
import { Spinner } from './components/Spinner';


// Hooks
import { useNavigation } from './hooks/useNavigation';
import { useLanguage } from './hooks/useLanguage';

// View/Page Components (Lazy Loaded)
const ExplorerView = React.lazy(() => import('./pages/ExplorerView'));
const LibraryView = React.lazy(() => import('./pages/LibraryView'));
const ScriptoriumView = React.lazy(() => import('./pages/ScriptoriumView'));
const RecRoomView = React.lazy(() => import('./pages/RecRoomView'));
const VideothekView = React.lazy(() => import('./pages/VideothekView'));
const AudiothekView = React.lazy(() => import('./pages/AudiothekView'));
const ImagesHubView = React.lazy(() => import('./pages/ImagesHubView'));
const UploaderHubView = React.lazy(() => import('./pages/UploaderHubView'));
const UploaderDetailView = React.lazy(() => import('./pages/UploaderDetailView'));
const SettingsView = React.lazy(() => import('./pages/SettingsView'));
const HelpView = React.lazy(() => import('./pages/HelpView'));
const StorytellerView = React.lazy(() => import('./pages/StorytellerView'));
const MyArchiveView = React.lazy(() => import('./pages/MyArchiveView'));
const AIArchiveView = React.lazy(() => import('./pages/AIArchiveView'));
const WebArchiveView = React.lazy(() => import('./pages/WebArchiveView'));

const PageSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full pt-20">
        <Spinner size="lg" />
    </div>
);

// This component bridges the Jotai toastAtom to the ToastContext
const ToastBridge: React.FC = () => {
    const { addToast } = useToast();
    const [toast, setToast] = useAtom(toastAtom); 
    
    useEffect(() => {
        // The atom's value is an object or null. We act when it's an object.
        if (toast) {
            addToast(toast.message, toast.type);
            // Reset the atom to prevent the toast from re-appearing on re-renders.
            setToast(null);
        }
    }, [toast, addToast, setToast]);

    return null;
};

const ACCENT_COLORS: Record<AccentColor, Record<string, string>> = {
  cyan: {
    '50': '#ecfeff', '100': '#cffafe', '200': '#a5f3fd', '300': '#67e8f9', '400': '#22d3ee',
    '500': '#06b6d4', '600': '#0891b2', '700': '#0e7490', '800': '#155e75', '900': '#164e63', '950': '#083344',
  },
  emerald: {
    '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399',
    '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22',
  },
  rose: {
    '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185',
    '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519',
  },
  violet: {
    '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa',
    '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065',
  },
};

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useAtom(activeViewAtom);
  const setModal = useSetAtom(modalAtom);
  const selectedProfile = useAtomValue(selectedProfileAtom);
  const profileReturnView = useAtomValue(profileReturnViewAtom);

  const defaultView = useAtomValue(defaultViewAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);
  const disableAnimations = useAtomValue(disableAnimationsAtom);
  const highContrastMode = useAtomValue(highContrastModeAtom);
  const underlineLinks = useAtomValue(underlineLinksAtom);
  const fontSize = useAtomValue(fontSizeAtom);
  const scrollbarColor = useAtomValue(scrollbarColorAtom);
  const accentColor = useAtomValue(accentColorAtom);
  
  const { navigateTo, goBackFromProfile } = useNavigation();
  
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem('app-settings-v2');
    let initialView: View;
    if (!storedSettings) {
        initialView = defaultSettings.defaultView;
    } else {
        // FIX: Explicitly type the parsed settings to avoid 'any' type and ensure type safety.
        const settings: Partial<AppSettings> = JSON.parse(storedSettings);
        initialView = settings.defaultView || defaultSettings.defaultView;
    }
    setActiveView(initialView);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.className = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const root = document.documentElement;
    const colors = ACCENT_COLORS[accentColor];
    for (const [shade, color] of Object.entries(colors)) {
      root.style.setProperty(`--color-accent-${shade}`, color);
    }

    if (disableAnimations) root.classList.add('no-animations'); else root.classList.remove('no-animations');
    if (highContrastMode) document.body.classList.add('high-contrast'); else document.body.classList.remove('high-contrast');
    if (underlineLinks) document.body.classList.add('underline-links'); else document.body.classList.remove('underline-links');
    
    document.body.style.fontSize = { sm: '14px', base: '16px', lg: '18px' }[fontSize];

    const styleId = 'custom-scrollbar-style';
    let style = document.getElementById(styleId) as HTMLStyleElement;
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.innerHTML = `::-webkit-scrollbar-thumb { background-color: ${scrollbarColor} !important; }`;
  }, [accentColor, disableAnimations, highContrastMode, underlineLinks, fontSize, scrollbarColor]);

  const openCommandPalette = useCallback(() => setModal({ type: 'commandPalette' }), [setModal]);

  const handleSelectItem = useCallback<SelectItemHandler>((item) => {
    if(item.mediatype === 'image') {
        setModal({ type: 'imageDetail', item });
    } else {
        setModal({ type: 'itemDetail', item });
    }
  }, [setModal]);

  const showConfirmation = useCallback((options: ConfirmationOptions) => {
    setModal({ type: 'confirmation', options });
  }, [setModal]);

  const renderView = () => {
    switch (activeView) {
      case 'explore': return <ExplorerView onSelectItem={handleSelectItem} />;
      case 'library': return <LibraryView />;
      case 'scriptorium': return <ScriptoriumView showConfirmation={showConfirmation} />;
      case 'recroom': return <RecRoomView onSelectItem={(item) => setModal({ type: 'emulator', item })} />;
      case 'movies': return <VideothekView onSelectItem={handleSelectItem} />;
      case 'audio': return <AudiothekView onSelectItem={handleSelectItem} />;
      case 'image': return <ImagesHubView onSelectItem={handleSelectItem} />;
      case 'uploaderHub': return <UploaderHubView />;
      case 'uploaderDetail':
        if (!selectedProfile) return <ExplorerView onSelectItem={handleSelectItem} />;
        return <UploaderDetailView profile={selectedProfile} onBack={goBackFromProfile} onSelectItem={handleSelectItem} returnView={profileReturnView} />;
      case 'settings': return <SettingsView showConfirmation={showConfirmation}/>;
      case 'help': return <HelpView />;
      case 'storyteller': return <StorytellerView />;
      case 'myArchive': return <MyArchiveView onSelectItem={handleSelectItem} />;
      case 'aiArchive': return <AIArchiveView />;
      case 'webArchive': return <WebArchiveView />;
      default:
        return <ExplorerView onSelectItem={handleSelectItem} />;
    }
  };

  return (
    <div className="md:pl-64">
      <SideMenu
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        activeView={activeView}
        setActiveView={navigateTo}
      />
      <Header onMenuClick={() => setIsSideMenuOpen(true)} onOpenCommandPalette={openCommandPalette} />
      
      <main className="p-4 sm:p-6 pb-20 md:pb-6 pt-18 h-screen overflow-y-auto">
         <ErrorBoundary>
            <Suspense fallback={<PageSpinner />}>
                {renderView()}
            </Suspense>
         </ErrorBoundary>
      </main>

      <BottomNav activeView={activeView} setActiveView={navigateTo} />
      <ModalManager />
    </div>
  );
}

const App: React.FC = () => (
  <ToastProvider>
    <ToastContainer />
    <ToastBridge />
    <AppContent />
  </ToastProvider>
);

export default App;
```

### `/types.ts`
```typescript
import React from 'react';

// --- Core App State ---
export type View =
  | 'explore'
  | 'library'
  | 'myArchive'
  | 'uploaderHub'
  | 'uploaderDetail'
  | 'scriptorium'
  | 'movies'
  | 'audio'
  | 'image'
  | 'recroom'
  | 'settings'
  | 'help'
  | 'storyteller'
  | 'aiArchive'
  | 'webArchive';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  confirmClass?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface Command {
    id: string;
    section: string;
    label: string;
    description?: string;
    icon?: React.ReactNode;
    action: () => void;
    keywords?: string;
}

// --- Archive.org API Types ---

export enum MediaType {
    Audio = 'audio',
    Movies = 'movies',
    Texts = 'texts',
    Image = 'image',
    Software = 'software',
    Collection = 'collection',
    Data = 'data',
    Web = 'web',
}

export interface ArchiveItemSummary {
  identifier: string;
  title: string;
  creator?: string | string[];
  publicdate: string;
  mediatype: MediaType;
  uploader?: string;
  'access-restricted-item'?: 'true' | 'false';
  downloads?: number;
  week?: number;
  avg_rating?: string;
  // Fix: Add optional properties for review data.
  reviewdate?: string;
  reviewtitle?: string;
  reviewbody?: string;
}

export interface ArchiveSearchResponse {
  response: {
    numFound: number;
    start: number;
    docs: ArchiveItemSummary[];
  };
}

export interface ArchiveFile {
    name: string;
    source: string;
    format: string;
    size?: string;
    length?: string;
}

export interface ArchiveMetadata {
    metadata: {
        identifier: string;
        title: string;
        creator?: string | string[];
        uploader?: string;
        publicdate: string;
        mediatype: MediaType;
        description?: string | string[];
        licenseurl?: string;
        collection?: string[];
        'access-restricted-item'?: 'true' | 'false';
    };
    files: ArchiveFile[];
    reviews?: {
        reviewtitle?: string;
        reviewbody?: string;
        stars?: string;
        reviewdate?: string;
        reviewer?: string;
    }[];
    similars?: {
        [key: string]: {
            count: number;
            items: ArchiveItemSummary[];
        }
    };
}

export type WaybackResponse = [string, string][];

// --- Application-Specific Types ---

export interface LibraryItem extends ArchiveItemSummary {
    notes: string;
    tags: string[];
    addedAt: number;
    collections: string[];
}

export interface WorksetDocument extends ArchiveItemSummary {
    notes: string;
    worksetId: string;
}

export interface Workset {
    id: string;
    name: string;
    documents: WorksetDocument[];
}

export type UploaderTab = 'uploads' | 'collections' | 'favorites' | 'reviews' | 'posts' | 'webArchive';

export type UploaderCategory = 'archivist' | 'institution' | 'music' | 'community' | 'software' | 'video' | 'history';

export interface Uploader {
  username: string;
  screenname?: string;
  searchUploader: string;
  searchField?: 'uploader' | 'creator' | 'scanner';
  descriptionKey: string;
  category: UploaderCategory;
  featured?: boolean;
}

export interface UploaderStats {
    total: number;
    movies: number;
    audio: number;
    texts: number;
    image: number;
    software: number;
    collections: number;
    favorites: number;
    reviews: number;
}
export interface Profile {
  name: string;
  searchIdentifier: string;
  type: 'uploader' | 'creator';
  curatedData?: Uploader;
}

export type Theme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'de';

export type SelectItemHandler = (item: ArchiveItemSummary) => void;

export type AccentColor = 'cyan' | 'emerald' | 'rose' | 'violet';

export interface AppSettings {
    // Search & Discovery
    resultsPerPage: number;
    showExplorerHub: boolean;
    defaultSort: 'downloads' | 'week' | 'publicdate';
    rememberFilters: boolean;
    rememberSort: boolean;
    
    // Appearance
    layoutDensity: 'comfortable' | 'compact';
    disableAnimations: boolean;
    accentColor: AccentColor;

    // Content & Hubs
    defaultView: View;
    defaultUploaderDetailTab: UploaderTab;
    defaultDetailTabAll: 'description' | 'files' | 'related';
    openLinksInNewTab: boolean;
    autoplayMedia: boolean;

    // AI Features
    enableAiFeatures: boolean;
    autoArchiveAI: boolean;
    defaultAiTab: 'description' | 'ai';
    autoRunEntityExtraction: boolean;
    summaryTone: 'simple' | 'detailed' | 'academic';

    // Accessibility
    highContrastMode: boolean;
    underlineLinks: boolean;
    fontSize: 'sm' | 'base' | 'lg';
    scrollbarColor: string;
}

export interface CategoryContent {
    title: string;
    description: string;
    collectionUrl?: string;
    contributors?: { name: string; role: string }[];
}


export type Availability = 'all' | 'free' | 'borrowable';

export interface Facets {
    mediaType: Set<MediaType>;
    yearStart?: number;
    yearEnd?: number;
    collection?: string;
    availability: Availability;
    language?: string;
}

export interface ExtractedEntities {
    people: string[];
    places: string[];
    organizations: string[];
    dates: string[];
}

export interface ImageAnalysisResult {
  description: string;
  tags: string[];
}
export interface MagicOrganizeResult {
    tags: string[];
    collections: string[];
}


export enum AIGenerationType {
    Summary = 'summary',
    Entities = 'entities',
    ImageAnalysis = 'imageAnalysis',
    DailyInsight = 'dailyInsight',
    Story = 'story',
    Answer = 'answer',
    MagicOrganize = 'magicOrganize',
    MoviesInsight = 'moviesInsight',
    AudioInsight = 'audioInsight',
    ImagesInsight = 'imagesInsight',
    RecRoomInsight = 'recRoomInsight',
}

export interface AIArchiveEntry {
  id: string;
  timestamp: number;
  type: AIGenerationType;
  content: string | ExtractedEntities | ImageAnalysisResult | MagicOrganizeResult;
  language: Language;
  source?: ArchiveItemSummary;
  sources?: ArchiveItemSummary[];
  prompt?: string;
  tags: string[];
  userNotes: string;
}

export type LibraryFilter =
  | { type: 'all' }
  | { type: 'untagged' }
  | { type: 'collection'; id: string }
  | { type: 'tag'; tag: string };

export interface UserCollection {
    id: string;
    name: string;
    itemIdentifiers: string[];
}

export type AIArchiveFilter =
  | { type: 'all' }
  | { type: 'generation'; generationType: AIGenerationType }
  | { type: 'language'; language: Language }
  | { type: 'tag'; tag: string };
```

### `/sw.js`
```javascript
const CACHE_NAME = 'internet-archive-explorer-v7';
const API_HOSTNAME = 'archive.org';
const CDN_HOSTNAME = 'aistudiocdn.com';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(STATIC_ASSETS);
    }).catch(err => {
        console.error('[SW] App shell caching failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: Navigation requests (HTML) -> Network first, then Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(networkResponse => {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          console.warn('[SW] Network failed for navigation. Serving from cache.');
          return caches.match('/'); // Fallback to the root app shell
        })
    );
    return;
  }
  
  // Strategy 2: API calls (archive.org) -> Network first, then Cache
  if (url.hostname.includes(API_HOSTNAME)) {
    event.respondWith(
        fetch(request)
            .then(networkResponse => {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(request, responseToCache);
                });
                return networkResponse;
            })
            .catch(() => {
                console.warn(`[SW] Network failed for API call to ${request.url}. Serving from cache.`);
                return caches.match(request).then(response => response || new Response(null, { status: 503, statusText: 'Service Unavailable' }));
            })
    );
    return;
  }

  // Strategy 3: Static assets (JS, CSS, CDN, etc.) -> Cache first, then Network
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
                cache.put(request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});
```

---

## Part 3: Service Layer

### `/services/archiveService.ts`
```typescript
import type { ArchiveSearchResponse, ArchiveMetadata, WaybackResponse, ArchiveItemSummary } from '../types';
import { metadataCache } from './cacheService';

const API_BASE_URL = 'https://archive.org';
const SEARCH_PAGE_SIZE = 24;

export class ArchiveServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArchiveServiceError';
  }
}

const handleFetchError = (e: unknown, context: string): never => {
    console.error(`Archive.org ${context} request failed:`, e);
    // If it's already our custom error, just re-throw it.
    if (e instanceof ArchiveServiceError) throw e;
    
    // Check for a network error (e.g., offline, CORS issue in some environments)
    if (e instanceof TypeError && e.message === 'Failed to fetch') {
        throw new ArchiveServiceError(`A network error occurred. Please check your internet connection and try again.`);
    }

    // Provide a more user-friendly generic message
    throw new ArchiveServiceError(`Could not retrieve ${context} from the Internet Archive. Please try again later.`);
};

async function apiFetch<T>(url: string, context: string): Promise<T> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new ArchiveServiceError(`Failed to fetch ${context}. Status: ${response.status} ${response.statusText}`);
        }
        // Handle cases where the response might be empty text, like in Wayback Machine
        const text = await response.text();
        if (!text) {
            return [] as T; // Return an empty array or appropriate empty value for the type T
        }
        return JSON.parse(text) as T;
    } catch (e) {
        handleFetchError(e, context);
    }
}

export const searchArchive = async (
  query: string,
  page: number,
  sorts: string[] = [],
  fields: string[] = ['identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader', 'access-restricted-item', 'week', 'downloads'],
  limit: number = SEARCH_PAGE_SIZE
): Promise<ArchiveSearchResponse> => {
  
  const params = new URLSearchParams({
    q: query || 'featured', // API requires a query
    fl: fields.join(','),
    rows: limit.toString(),
    page: page.toString(),
    output: 'json',
  });

  if (sorts.length > 0) {
    sorts.forEach(sort => params.append('sort[]', sort));
  } else if (query !== 'featured') { // only apply default sort if not a featured query
     params.append('sort[]', '-publicdate');
  }

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;
  return apiFetch<ArchiveSearchResponse>(url, 'search results');
};

export const getItemMetadata = async (identifier: string): Promise<ArchiveMetadata> => {
    if (metadataCache.has(identifier)) {
        return metadataCache.get(identifier)!;
    }
    const url = `${API_BASE_URL}/metadata/${identifier}`;
    const data = await apiFetch<ArchiveMetadata>(url, `metadata for ${identifier}`);
    metadataCache.set(identifier, data);
    return data;
};

export const getItemPlainText = async (identifier: string): Promise<string> => {
  const txtUrl = `${API_BASE_URL}/stream/${identifier}/${identifier}_djvu.txt`;
  
  try {
    const response = await fetch(txtUrl);
    if (!response.ok) {
      if (response.status === 404) {
         const response2 = await fetch(`${API_BASE_URL}/stream/${identifier}/${identifier}.txt`);
         if(response2.ok) {
            return await response2.text();
         }
      }
      throw new ArchiveServiceError(`Failed to fetch plain text for ${identifier}. Status: ${response.status}`);
    }
    const text = await response.text();
    // Basic cleanup
    return text.replace(/(\r\n|\n|\r)/gm, "\n").trim();
  } catch (error) {
    handleFetchError(error, `plain text for ${identifier}`);
  }
};

export const searchWaybackMachine = async (url: string): Promise<WaybackResponse> => {
  const cdxUrl = `https://web.archive.org/cdx/search/cdx?url=${encodeURIComponent(url)}&output=json&fl=timestamp,original&collapse=digest`;
  
  const data = await apiFetch<any[]>(cdxUrl, 'Wayback Machine results');
  if (Array.isArray(data) && data.length > 0) {
    // The first row is the header, slice it off.
    return data.slice(1);
  }
  return [];
};

export const getItemCount = async (query: string): Promise<number> => {
  const params = new URLSearchParams({
    q: query,
    rows: '0', // We don't need any documents, just the count
    output: 'json',
  });

  const url = `${API_BASE_URL}/advancedsearch.php?${params.toString()}`;
  const data = await apiFetch<ArchiveSearchResponse>(url, `item count for query "${query}"`);
  return data?.response?.numFound || 0;
};

export const getReviewsByUploader = async (
  uploader: string,
  page: number,
  limit: number = 10
): Promise<ArchiveSearchResponse> => {
  const query = `reviewer:("${uploader}")`;
  const fields = [
    'identifier', 'title', 'creator', 'publicdate', 'mediatype', 'uploader',
    'reviewdate', 'reviewtitle', 'reviewbody', 'access-restricted-item'
  ];
  return searchArchive(query, page, ['-reviewdate'], fields, limit);
};
```

### `/services/geminiService.ts`
```typescript
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import type { ExtractedEntities, ImageAnalysisResult } from '../types';

// Lazily initialize the Google Gemini API client
let ai: GoogleGenAI | null = null;
let initError: GeminiServiceError | null = null;

class GeminiServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

function initializeAi() {
    // This function will be called before any AI operation.
    // It initializes the client once, and caches any initialization error.
    if (ai) return; // Already initialized successfully
    if (initError) throw initError; // Don't try again if it failed once

    try {
        // Per instructions, the API key is expected to be in the execution environment.
        // If 'process' is not defined, this will throw a ReferenceError, which we catch.
        ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    } catch (e) {
        console.error("Gemini AI initialization failed. This is likely due to a missing or misconfigured API key in the deployment environment.", e);
        // Create and cache the error to be thrown on subsequent calls.
        initError = new GeminiServiceError('The AI service could not be initialized. Please check the application configuration and ensure the API key is available.');
        throw initError;
    }
}

/**
 * A helper function to call the Gemini API and handle errors.
 */
const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
    initializeAi(); // Initialize on first use
    try {
        const response: GenerateContentResponse = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API request failed:', error);
        if (error instanceof GeminiServiceError) throw error;
        throw new GeminiServiceError('The AI could not generate a response. Please try again.');
    }
};

/**
 * Generates a summary for a given text, with a specified tone.
 */
export const getSummary = async (text: string, language: string, tone: 'simple' | 'detailed' | 'academic'): Promise<string> => {
    const systemInstruction = `You are a helpful assistant. Summarize the following text in a ${tone} tone. The summary should be in ${language}.`;
    const prompt = `Please summarize the following text:\n\n---\n\n${text}`;
    return generateText(prompt, systemInstruction);
};

/**
 * Extracts named entities (people, places, organizations, dates) from a text.
 */
export const extractEntities = async (text: string, language: string): Promise<ExtractedEntities> => {
    initializeAi();
    const schema = {
        type: Type.OBJECT,
        properties: {
            people: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Names of individuals.' },
            places: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Geographical locations like cities, countries.' },
            organizations: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Companies, institutions, groups.' },
            dates: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Specific dates or time periods mentioned.' },
        },
        required: ['people', 'places', 'organizations', 'dates']
    };

    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Extract the key named entities (people, places, organizations, dates) from the following text. The response should be in ${language}.\n\nTEXT: "${text}"`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return {
            people: parsed.people || [],
            places: parsed.places || [],
            organizations: parsed.organizations || [],
            dates: parsed.dates || [],
        };
    } catch (error) {
        console.error('Gemini API entity extraction failed:', error);
        if (error instanceof GeminiServiceError) throw error;
        throw new GeminiServiceError('The AI could not extract entities from the text.');
    }
};

/**
 * Answers a question based on a provided text context.
 */
export const answerFromText = async (question: string, context: string, language: string): Promise<string> => {
    const systemInstruction = `You are an expert at answering questions based on a given text. Answer the user's question using only the information from the provided context. Answer in ${language}.`;
    const prompt = `CONTEXT:\n---\n${context}\n---\n\nQUESTION: ${question}`;
    return generateText(prompt, systemInstruction);
};

/**
 * Generates a short, creative story based on a user's prompt.
 */
export const generateStory = async (prompt: string, language: string): Promise<string> => {
    const systemInstruction = `You are a creative storyteller. Write a short, engaging story based on the user's prompt. Write the story in ${language}.`;
    return generateText(prompt, systemInstruction);
};

/**
 * Generates a fictional historical event summary based on a list of trending item titles.
 */
export const generateDailyHistoricalEvent = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are a creative historian. Based on the following list of item titles, invent a plausible or interesting historical event that connects some of them. Be brief (2-3 sentences) and engaging. Write in ${language}.`;
    const prompt = `Item Titles: ${titles.join(', ')}. \n\nWhat interesting historical connection can you invent?`;
    return generateText(prompt, systemInstruction);
};

/**
 * Suggests tags and collections for a list of library items.
 */
export const organizeLibraryItems = async (items: { title: string; description?: string }[], language: string): Promise<{ tags: string[]; collections: string[] }> => {
    initializeAi();
    const schema = {
        type: Type.OBJECT,
        properties: {
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 5-7 relevant, single-word or short-phrase tags for these items.'
            },
            collections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 2-3 potential collection names these items could belong to.'
            },
        },
        required: ['tags', 'collections']
    };
    
    const itemList = items.map(item => `- ${item.title}`).join('\n');

    try {
        const response = await ai!.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze this list of library items and suggest relevant tags and collection names. The response should be in ${language}.\n\nITEMS:\n${itemList}`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });
        
        const jsonStr = response.text.trim();
        const parsed = JSON.parse(jsonStr);
        return {
            tags: parsed.tags || [],
            collections: parsed.collections || [],
        };
    } catch (error) {
        console.error('Gemini API organization failed:', error);
        if (error instanceof GeminiServiceError) throw error;
        throw new GeminiServiceError('The AI could not generate organizational suggestions.');
    }
};

/**
 * Analyzes an image and returns a description and relevant tags.
 */
export const analyzeImage = async (base64ImageData: string, mimeType: string, language: string): Promise<ImageAnalysisResult> => {
    initializeAi();
    const schema = {
        type: Type.OBJECT,
        properties: {
            description: { type: Type.STRING, description: 'A detailed, objective description of the image content, focusing on facts.' },
            tags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'A list of 5-7 relevant, specific keywords or tags based on the image content (e.g., "astronaut", "lunar module", "space suit").'
            },
        },
        required: ['description', 'tags']
    };

    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: `Analyze this image. Provide a detailed description and suggest relevant search tags. Respond in ${language}.` };

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const parsed = JSON.parse(response.text.trim());
        return {
            description: parsed.description || '',
            tags: parsed.tags || [],
        };
    } catch (error) {
        console.error('Gemini API image analysis failed:', error);
        if (error instanceof GeminiServiceError) throw error;
        throw new GeminiServiceError('The AI could not analyze the image.');
    }
};

/**
 * Asks a follow-up question about an image.
 */
export const askAboutImage = async (base64ImageData: string, mimeType: string, question: string, language: string): Promise<string> => {
    initializeAi();
    const imagePart = { inlineData: { data: base64ImageData, mimeType } };
    const textPart = { text: question };
    const systemInstruction = `You are an expert at analyzing images. Answer the user's question about the image concisely. Respond in ${language}.`;

    try {
        const response = await ai!.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: {
                systemInstruction,
            },
        });
        return response.text;
    } catch (error) {
        console.error('Gemini API image question failed:', error);
        if (error instanceof GeminiServiceError) throw error;
        throw new GeminiServiceError('The AI could not answer the question about the image.');
    }
};

// --- Hub-Specific Creative Insights ---

export const generateFilmDoubleFeatureConcept = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are a creative film critic and cinema historian. Based on the following list of film titles, create a short, imaginative concept for a 'double feature' night. Describe the theme that connects the films and give the event a catchy title. Be engaging and write in ${language}.`;
    const prompt = `Film Titles: ${titles.join(', ')}. \n\nCreate a double feature concept.`;
    return generateText(prompt, systemInstruction);
};

export const generateRadioShowConcept = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are a creative radio DJ and music historian. Based on the following list of audio titles (concerts, albums, etc.), invent a short concept for a fictional radio show episode. Give the episode a catchy title and briefly describe its theme. Be imaginative and write in ${language}.`;
    const prompt = `Audio Titles: ${titles.join(', ')}. \n\nCreate a radio show concept.`;
    return generateText(prompt, systemInstruction);
};

export const generateMuseumExhibitConcept = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are an imaginative museum curator. Based on the following list of image titles from various collections, invent a concept for a small, themed gallery exhibition. Give the exhibition a creative title and write a short, compelling description (2-3 sentences) that connects the images. Write in ${language}.`;
    const prompt = `Image Titles: ${titles.join(', ')}. \n\nCreate a museum exhibit concept.`;
    return generateText(prompt, systemInstruction);
};

export const generateRetroGamingNote = async (titles: string[], language: string): Promise<string> => {
    const systemInstruction = `You are a nostalgic retro gaming journalist from the 1990s. Based on the following list of classic game titles, write a short, imaginative 'editor's note' for a fictional gaming magazine. Connect the games with a common theme or invent a fun anecdote about discovering them. Be creative and write in ${language}.`;
    const prompt = `Game Titles: ${titles.join(', ')}. \n\nWrite a retro gaming magazine note.`;
    return generateText(prompt, systemInstruction);
};
```

### `/services/aiPersistenceService.ts`
```typescript
import { v4 as uuidv4 } from 'uuid';
import type { AIArchiveEntry, AIGenerationType, ExtractedEntities, ImageAnalysisResult, Language, MagicOrganizeResult } from '../types';

// This service is now the single source of truth for retrieving and persisting AI generations.
// It reads from and writes to the global `aiArchiveAtom` via arguments passed from components.

// --- Read operations (used as a cache) ---

/**
 * Finds a previously generated daily insight for the current day and language.
 * @param language The language of the insight.
 * @param archive The full AI archive array.
 * @returns The insight summary string, or null if not found.
 */
export const findArchivedDailyInsight = (language: Language, archive: AIArchiveEntry[]): string | null => {
    const today = new Date().toDateString();
    const found = archive.find(entry => 
        entry.type === 'dailyInsight' &&
        entry.language === language &&
        new Date(entry.timestamp).toDateString() === today
    );
    return (found?.content as string) || null;
};


/**
 * Finds a previously generated analysis for a specific Internet Archive item.
 * @param identifier The item identifier.
 * @param type The type of analysis (e.g., 'summary', 'entities').
 * @param archive The full AI archive array.
 * @param options Additional options to match, like the summary tone.
 * @returns The found analysis data, or null.
 */
export const findArchivedItemAnalysis = <T>(
    identifier: string, 
    type: AIGenerationType,
    archive: AIArchiveEntry[],
    options?: Record<string, any>
): T | null => {
    const found = archive.find(entry => {
        if (entry.type !== type || entry.source?.identifier !== identifier) {
            return false;
        }
        // If options are provided, check if the prompt matches.
        // This is a simple way to check for things like summary tone.
        if (options) {
             try {
                const promptData = JSON.parse(entry.prompt || '{}');
                return Object.entries(options).every(([key, value]) => promptData[key] === value);
             } catch {
                return false;
             }
        }
        return true;
    });

    return (found?.content as T) || null;
};

// --- Write operations (archiving new generations) ---

/**
 * Creates and saves a new AIArchiveEntry to the global store via a setter function,
 * respecting the user's auto-archive setting.
 * @param data The data for the new archive entry.
 * @param addEntry The Jotai setter function for adding an entry.
 * @param autoArchive A boolean indicating if the user has auto-archiving enabled.
 */
export const archiveAIGeneration = (
    data: Omit<AIArchiveEntry, 'id' | 'timestamp' | 'tags' | 'userNotes'>,
    addEntry: (entry: AIArchiveEntry) => void,
    autoArchive: boolean
): void => {
    if (!autoArchive) return;

    const newEntry: AIArchiveEntry = {
        ...data,
        id: uuidv4(),
        timestamp: Date.now(),
        tags: [data.type], // Auto-tag with the generation type
        userNotes: '',
    };
    
    if (data.source?.mediatype) {
        newEntry.tags.push(data.source.mediatype);
    }
    
    // For entities, auto-add the first few entities as tags
    if (data.type === 'entities' && typeof data.content === 'object' && data.content) {
        const entities = data.content as ExtractedEntities;
        const entityTags = [...entities.people, ...entities.organizations, ...entities.places]
            .slice(0, 3) // Take the first 3 prominent entities
            .map(e => e.toLowerCase());
        newEntry.tags.push(...entityTags);
    }
    
    // For Magic Organize, auto-add the suggested tags as entry tags
    if (data.type === 'magicOrganize' && typeof data.content === 'object' && data.content) {
        const suggestions = data.content as MagicOrganizeResult;
        const suggestionTags = suggestions.tags.slice(0, 5).map(t => t.toLowerCase());
        newEntry.tags.push(...suggestionTags);
    }
    
    newEntry.tags = [...new Set(newEntry.tags)]; // Ensure unique tags

    addEntry(newEntry);
};
```

### `/services/cacheService.ts`
```typescript
import type { ArchiveMetadata } from '../types';

const createSessionStorageCache = <T,>(key: string, maxSize: number = 50) => {
    const getCache = (): { [key: string]: T } => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : {};
        } catch (error) {
            console.error(`Error reading sessionStorage key “${key}”:`, error);
            return {};
        }
    };

    const setCache = (cache: { [key: string]: T }) => {
        try {
            // Simple LRU-like eviction strategy to prevent sessionStorage from growing too large
            const keys = Object.keys(cache);
            if (keys.length > maxSize) {
                const keysToDelete = keys.slice(0, keys.length - maxSize);
                for (const keyToDelete of keysToDelete) {
                    delete cache[keyToDelete];
                }
            }
            sessionStorage.setItem(key, JSON.stringify(cache));
        } catch (error) {
            console.error(`Error setting sessionStorage key “${key}”:`, error);
        }
    };

    return {
        has: (id: string): boolean => {
            return id in getCache();
        },
        get: (id: string): T | undefined => {
            const cache = getCache();
            const value = cache[id];
            // Move accessed item to the end to mark it as recently used
            if (value) {
                delete cache[id];
                cache[id] = value;
                setCache(cache);
            }
            return value;
        },
        set: (id: string, value: T): void => {
            const cache = getCache();
            // If item already exists, remove it to re-insert at the end
            if (cache[id]) {
                delete cache[id];
            }
            cache[id] = value;
            setCache(cache);
        },
    };
};

export const metadataCache = createSessionStorageCache<ArchiveMetadata>('metadata-cache');
```

### `/services/dataService.ts`
```typescript
import type { AppSettings, LibraryItem, Workset } from '../types';
import { STORAGE_KEYS as SETTINGS_KEYS } from '../store/settings';
import { STORAGE_KEYS as FAVORITES_KEYS } from '../store/favorites';
import { STORAGE_KEYS as SEARCH_KEYS } from '../store/search';
import { STORAGE_KEY as SCRIPTORIUM_KEY } from '../store/scriptorium';

interface BackupData {
    version: number;
    timestamp: string;
    settings: AppSettings;
    libraryItems: LibraryItem[];
    uploaderFavorites: string[];
    scriptoriumWorksets: Workset[];
    searchHistory: string[];
}

const CURRENT_VERSION = 1;

/**
 * Gathers all relevant data from localStorage and prepares it for export.
 */
export const exportAllData = (): string => {
    const data: Partial<BackupData> = {
        version: CURRENT_VERSION,
        timestamp: new Date().toISOString(),
    };

    try {
        data.settings = JSON.parse(localStorage.getItem(SETTINGS_KEYS.settings) || '{}');
        // Convert the library items record to an array for export consistency.
        data.libraryItems = Object.values(JSON.parse(localStorage.getItem(FAVORITES_KEYS.libraryItems) || '{}'));
        data.uploaderFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEYS.uploaderFavorites) || '[]');
        data.scriptoriumWorksets = JSON.parse(localStorage.getItem(SCRIPTORIUM_KEY) || '[]');
        data.searchHistory = JSON.parse(localStorage.getItem(SEARCH_KEYS.searchHistory) || '[]');
        
        return JSON.stringify(data, null, 2);
    } catch (error) {
        console.error("Error exporting data:", error);
        throw new Error("Failed to export data. Check console for details.");
    }
};

/**
 * Imports data from a JSON string, validates it, and saves it to localStorage.
 * @param jsonString The JSON string from the imported file.
 */
export const importData = (jsonString: string): void => {
    try {
        const data: BackupData = JSON.parse(jsonString);

        if (!data || typeof data.version !== 'number') {
            throw new Error('Invalid backup file. The file is not a valid Archive Explorer backup.');
        }
        if (data.version !== CURRENT_VERSION) {
            throw new Error(`Unsupported backup version. Expected version ${CURRENT_VERSION}, but file is version ${data.version}.`);
        }


        // Validate and save each part
        if (data.settings) localStorage.setItem(SETTINGS_KEYS.settings, JSON.stringify(data.settings));
        
        // Convert imported library items array back into a record for storage.
        if (Array.isArray(data.libraryItems)) {
             const libraryItemsRecord = data.libraryItems.reduce((acc, item) => {
                acc[item.identifier] = item;
                return acc;
            }, {} as Record<string, LibraryItem>);
            localStorage.setItem(FAVORITES_KEYS.libraryItems, JSON.stringify(libraryItemsRecord));
        }

        if (data.uploaderFavorites) localStorage.setItem(FAVORITES_KEYS.uploaderFavorites, JSON.stringify(data.uploaderFavorites));
        if (data.scriptoriumWorksets) localStorage.setItem(SCRIPTORIUM_KEY, JSON.stringify(data.scriptoriumWorksets));
        if (data.searchHistory) localStorage.setItem(SEARCH_KEYS.searchHistory, JSON.stringify(data.searchHistory));

    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error("Import failed: The file is not a valid JSON file.");
        }
        console.error("Error importing data:", error);
        throw error instanceof Error ? error : new Error("An unknown error occurred during import.");
    }
};
```
