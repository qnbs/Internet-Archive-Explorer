# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

An advanced, production-ready web portal for exploring the vast collection of the Internet Archive. This application combines a modern, responsive user interface with powerful discovery tools, personal research spaces, and a deep, multi-faceted integration of the Google Gemini AI for analysis and content generation. It is a fully-featured Progressive Web App (PWA), enabling installation and offline access.

### Live Demo & Code in AI Studio

This application was developed and is hosted in **AI Studio**, a powerful web-based development environment for prototyping and building AI-integrated applications.

> **[Explore and fork this project in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Via the link above, you can access the full source code, experiment with changes, and even deploy your own version of this application.

---

## Table of Contents
- [Core Features](#core-features)
  - [Unified Discovery Engine](#unified-discovery-engine)
  - [Curated Content Hubs](#curated-content-hubs)
  - [Personalization Engine](#personalization-engine)
    - [My Library: A Personal Curation Space](#my-library-a-personal-curation-space)
    - [My Archive & Contributor Profiles](#my-archive--contributor-profiles)
  - [Research & Analysis Tools](#research--analysis-tools)
    - [The Scriptorium: A Researcher's Workspace](#the-scriptorium-a-researchers-workspace)
    - [AI Archive: Your Personal AI Memory](#ai-archive-your-personal-ai-memory)
- [Comprehensive AI Integration (Gemini)](#comprehensive-ai-integration-gemini)
- [Power-User Tools & PWA](#power-user-tools--pwa)
- [Technical Deep-Dive](#technical-deep-dive)
  - [Technology Stack](#technology-stack)
  - [Architectural Highlights](#architectural-highlights)
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
-   **Audiothek**: Discover live music, old-time radio shows, and audiobooks. Features a persistent site-wide audio player with playlist management.
-   **Images Hub**: Explore historical photos, art from museums like The Met, and scientific imagery from NASA.
-   **Rec Room**: Play thousands of classic MS-DOS games and software directly in the browser via emulation.
-   **Web Archive**: A dedicated interface for querying the Wayback Machine for archived websites.
-   **Storyteller**: An interactive, AI-powered tool that generates unique short stories based on your prompts.

### Personalization Engine

#### My Library: A Personal Curation Space
A central hub for all your saved items and followed contributors, organized in a three-pane layout for desktop:
-   **Collections & Tags**: Organize saved items into custom collections or filter them by user-defined tags.
-   **Item List & Bulk Actions**: Manage saved items with search and sorting. A "Select Mode" allows for batch-selecting items to add them to collections, add tags, delete them, or use "Magic Organize."
-   **Detail Pane & Notes**: View details of a selected item, write and save personal notes (with rich text support), and manage tags without leaving the library view.

#### My Archive & Contributor Profiles
-   **Unified Profile Engine**: The application features a single, powerful profile view that serves two purposes. It can display the public profile of any contributor on the Internet Archive, or it can function as a personal dashboard for your own account.
-   **My Archive Dashboard**: Connect your public Internet Archive screen name to use the profile view as a personal dashboard for your own contributions, stats, and activity. The connection is verified using your public uploads and is stored locally.
-   **Dynamic Content Tabs**: Each profile is a dynamic dashboard of the contributor's activity. Tabs for **Uploads, Collections, Favorites, Reviews, Forum Posts,** and **Web Archives** automatically appear only if the user has content in that category.
-   **Powerful Upload Filtering**: The main "Uploads" tab is an interactive archive in its own right, featuring a built-in control panel to filter all of a contributor's uploads by media type and sort by criteria like popularity or publication date.

### Research & Analysis Tools

#### The Scriptorium: A Researcher's Workspace
-   **Personal Worksets**: A personal workspace for text-based research. Group documents from the archive into "Worksets" to organize your projects.
-   **Integrated Reader & AI Tools**: The Scriptorium features a two-panel resizable view with an integrated document reader and a rich text editor for notes. It's enhanced with powerful AI tools.
-   **Persistent Notes**: Write and save personal notes for each document within a workset, with changes autosaved.

#### AI Archive: Your Personal AI Memory
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

### Architectural Highlights
-   **State Management (Jotai)**: Jotai was chosen for its atomic approach. This allows for highly optimized re-renders, as components subscribe only to the specific atoms of state they need. This prevents the "waterfall" re-render problem common in context-based state management and results in significantly better performance. The use of `safeAtomWithStorage` provides robust persistence to `localStorage`, gracefully handling potential data corruption without crashing the app.
-   **Performance by Design**:
    -   **Code Splitting**: Each main view is split into its own chunk using `React.lazy` to ensure a fast initial page load.
    -   **Debouncing**: User inputs are debounced to prevent excessive API calls.
    -   **Infinite Scrolling**: `useInfiniteScroll` provides a smooth experience when browsing long lists of results by fetching more data just before the user reaches the end of the list.
    -   **Memoization**: `React.memo`, `useCallback`, and `useMemo` are used strategically to prevent unnecessary component re-renders.
-   **Robust Services**: External communications are encapsulated in dedicated service modules (`archiveService.ts`, `geminiService.ts`). These include robust error handling, caching strategies, and lazy initialization for the AI client to ensure resilience and efficiency.
-   **Accessibility (A11y) & Internationalization (i18n)**:
    -   **Semantic HTML & ARIA**: Proper use of ARIA roles and attributes throughout the application, especially for modals, tabs, and interactive elements.
    -   **Focus Management**: The `useModalFocusTrap` hook correctly traps focus within all modals, ensuring keyboard accessibility.
    -   **User Settings**: Includes options like "Reduce Motion," "High Contrast Mode," and adjustable font sizes.
    -   **Full Internationalization**: The entire application is translated into English and German, managed through a system of JSON files loaded on demand.

## Getting Started
The easiest way to run this application is directly in AI Studio via the link provided at the top.

### Environment Variables
To use the AI-powered features, you must provide a Google Gemini API key.
-   `API_KEY`: Your Google Gemini API Key.

This key is expected as an environment variable in the execution context (e.g., AI Studio's secrets manager).

## Project Structure
```
/
├── App.tsx
├── README.md
├── components/
│   ├── (Reusable UI Components)
│   ├── ai-archive/
│   ├── audiothek/
│   ├── library/
│   ├── scriptorium/
│   ├── settings/
│   └── uploader/
├── contexts/
├── hooks/
├── locales/ (en/, de/)
├── pages/ (All main views)
├── services/
├── store/ (Jotai atoms)
├── utils/
└── ... (Config files)
```

## License
This project is licensed under the MIT License.

---
<br>
<hr>
<br>

# Internet Archive Explorer (Deutsch)

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/) [![PWA](https://img.shields.io/badge/PWA-Ready-blue?logo=pwa)](https://web.dev/progressive-web-apps/)

Ein hochentwickeltes, produktionsreifes Webportal zur Erkundung der riesigen Sammlung des Internet Archive. Diese Anwendung kombiniert eine moderne, reaktionsschnelle Benutzeroberfläche mit leistungsstarken Entdeckungswerkzeugen, persönlichen Forschungsbereichen und einer tiefen, vielschichtigen Integration der Google Gemini KI für Analyse und Inhaltserstellung. Es ist eine voll funktionsfähige Progressive Web App (PWA), die Installation und Offline-Zugriff ermöglicht.

### Live-Demo & Code in AI Studio

Diese Anwendung wurde in **AI Studio** entwickelt und wird dort gehostet, einer leistungsstarken webbasierten Entwicklungsumgebung für das Prototyping und die Erstellung von KI-integrierten Anwendungen.

> **[Entdecken und forken Sie dieses Projekt in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Über den obigen Link können Sie auf den vollständigen Quellcode zugreifen, mit Änderungen experimentieren und sogar Ihre eigene Version dieser Anwendung bereitstellen.

---

## Inhaltsverzeichnis (Deutsch)
- [Kernfunktionen](#kernfunktionen-de)
  - [Einheitliche Entdeckungs-Engine](#einheitliche-entdeckungs-engine-de)
  - [Kuratierte Inhalts-Hubs](#kuratierte-inhalts-hubs-de)
  - [Personalisierungs-Engine](#personalisierungs-engine-de)
    - [Meine Bibliothek: Ein persönlicher Kurationsraum](#meine-bibliothek-ein-persönlicher-kurationsraum-de)
    - [Mein Archiv & Mitwirkenden-Profile](#mein-archiv--mitwirkenden-profile-de)
  - [Forschungs- und Analysewerkzeuge](#forschungs-und-analysewerkzeuge-de)
    - [Das Scriptorium: Ein Arbeitsbereich für Forschende](#das-scriptorium-ein-arbeitsbereich-für-forschende-de)
    - [KI-Archiv: Ihr persönliches KI-Gedächtnis](#ki-archiv-ihr-persönliches-ki-gedächtnis-de)
- [Umfassende KI-Integration (Gemini)](#umfassende-ki-integration-gemini-de)
- [Power-User-Tools & PWA](#power-user-tools--pwa-de)
- [Technischer Einblick](#technischer-einblick-de)
  - [Technologie-Stack](#technologie-stack-de)
  - [Architektonische Highlights](#architektonische-highlights-de)
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
-   **Audiothek**: Entdecken Sie Live-Musik, alte Radiosendungen und Hörbücher. Verfügt über einen seitenweiten Audio-Player mit Playlist-Verwaltung.
-   **Bilder-Hub**: Erkunden Sie historische Fotos, Kunst von Museen wie dem Met und wissenschaftliche Bilder der NASA.
-   **Rec Room**: Spielen Sie Tausende von klassischen MS-DOS-Spielen und Software direkt im Browser per Emulation.
-   **Web-Archiv**: Eine dedizierte Oberfläche zur Abfrage der Wayback Machine für archivierte Websites.
-   **Storyteller**: Ein interaktives, KI-gestütztes Tool, das auf der Grundlage Ihrer Eingaben einzigartige Kurzgeschichten erstellt.

### <a name="personalisierungs-engine-de"></a>Personalisierungs-Engine

#### <a name="meine-bibliothek-ein-persönlicher-kurationsraum-de"></a>Meine Bibliothek: Ein persönlicher Kurationsraum
Ein zentraler Hub für alle Ihre gespeicherten Inhalte und Mitwirkenden, organisiert in einem Drei-Fenster-Layout für Desktops:
-   **Sammlungen & Tags**: Organisieren Sie gespeicherte Elemente in benutzerdefinierten Sammlungen oder filtern Sie sie nach benutzerdefinierten Tags.
-   **Gegenstandsliste & Massenaktionen**: Verwalten Sie gespeicherte Elemente mit Suche und Sortierung. Ein "Auswahlmodus" ermöglicht die gleichzeitige Auswahl mehrerer Elemente, um sie zu Sammlungen hinzuzufügen, Tags hinzuzufügen, sie zu löschen oder "Magisch Organisieren" zu verwenden.
-   **Detailansicht & Notizen**: Sehen Sie Details zu einem ausgewählten Element, schreiben und speichern Sie persönliche Notizen (mit Rich-Text-Unterstützung) und verwalten Sie Tags, ohne die Bibliotheksansicht zu verlassen.

#### <a name="mein-archiv--mitwirkenden-profile-de"></a>Mein Archiv & Mitwirkenden-Profile
-   **Einheitliche Profil-Engine**: Die Anwendung verfügt über eine einzige, leistungsstarke Profilansicht, die zwei Zwecken dient. Sie kann das öffentliche Profil eines jeden Mitwirkenden im Internet Archive anzeigen oder als persönliches Dashboard für Ihr eigenes Konto fungieren.
-   **Mein Archiv-Dashboard**: Verbinden Sie Ihren öffentlichen Internet-Archive-Anzeigenamen, um die Profilansicht als persönliches Dashboard für Ihre eigenen Beiträge, Statistiken und Aktivitäten zu nutzen. Die Verbindung wird anhand Ihrer öffentlichen Uploads überprüft und lokal gespeichert.
-   **Dynamische Inhalts-Tabs**: Jedes Profil ist ein dynamisches Dashboard der Aktivitäten des Mitwirkenden. Tabs für **Uploads, Sammlungen, Favoriten, Rezensionen, Forenbeiträge** und **Web-Archive** erscheinen automatisch nur dann, wenn der Benutzer Inhalte in dieser Kategorie hat.
-   **Leistungsstarke Upload-Filterung**: Der Haupt-Tab "Uploads" ist ein interaktives Archiv für sich. Er verfügt über ein integriertes Bedienfeld, mit dem Sie alle Uploads eines Mitwirkenden nach Medientyp filtern und nach Kriterien wie Beliebtheit oder Veröffentlichungsdatum sortieren können.

### <a name="forschungs-und-analysewerkzeuge-de"></a>Forschungs- und Analysewerkzeuge

#### <a name="das-scriptorium-ein-arbeitsbereich-für-forschende-de"></a>Das Scriptorium: Ein Arbeitsbereich für Forschende
-   **Persönliche Worksets**: Ein persönlicher Arbeitsbereich für textbasierte Forschung. Gruppieren Sie Dokumente aus dem Archiv in "Worksets", um Ihre Projekte zu organisieren.
-   **Integrierter Reader & KI-Tools**: Das Scriptorium verfügt über eine zweigeteilte, anpassbare Ansicht mit einem integrierten Dokumentenleser und einem Rich-Text-Editor für Notizen, erweitert um leistungsstarke KI-Werkzeuge.
-   **Persistente Notizen**: Schreiben und speichern Sie persönliche Notizen für jedes Dokument innerhalb eines Worksets, wobei Änderungen automatisch gespeichert werden.

#### <a name="ki-archiv-ihr-persönliches-ki-gedächtnis-de"></a>KI-Archiv: Ihr persönliches KI-Gedächtnis
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
-   **Retro-Gaming-Notiz (Rec Room)**: Schreibt eine nostalgische "Anmerkung des Herausgebers" für ein fiktives Gaming-Magazin, basierend auf einer Liste klassischer Spiele.
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

### <a name="architektonische-highlights-de"></a>Architektonische Highlights
-   **State Management (Jotai)**: Jotai wurde aufgrund seines atomaren Ansatzes gewählt. Dies ermöglicht ein hochgradig optimiertes Rerendering, da Komponenten nur die spezifischen Zustandsatome abonnieren, die sie benötigen. Dies verhindert das "Wasserfall"-Rerendering-Problem und führt zu einer deutlich besseren Leistung. Die Verwendung von `safeAtomWithStorage` sorgt für eine robuste Persistenz im `localStorage`, die potenzielle Datenbeschädigungen ohne Absturz der App elegant handhabt.
-   **Performance by Design**:
    -   **Code Splitting**: Jede Hauptansicht wird mit `React.lazy` in einen eigenen Chunk aufgeteilt, um eine schnelle anfängliche Ladezeit zu gewährleisten.
    -   **Debouncing**: Benutzereingaben werden entprellt, um übermäßige API-Aufrufe zu verhindern.
    -   **Infinite Scrolling**: `useInfiniteScroll` sorgt für ein reibungsloses Erlebnis beim Durchsuchen langer Ergebnislisten.
    -   **Memoization**: `React.memo`, `useCallback` und `useMemo` werden gezielt eingesetzt, um unnötige Rerenderings zu verhindern.
-   **Robuste Services**: Externe Kommunikation ist in dedizierten Servicemodulen gekapselt. Diese beinhalten robuste Fehlerbehandlung, Caching-Strategien und eine verzögerte Initialisierung des KI-Clients.
-   **Barrierefreiheit (A11y) & Internationalisierung (i18n)**:
    -   **Semantisches HTML & ARIA**: Korrekte Verwendung von ARIA-Rollen und -Attributen.
    -   **Fokus-Management**: Der `useModalFocusTrap`-Hook fängt den Fokus korrekt in allen Modalfenstern ein.
    -   **Benutzereinstellungen**: Umfasst Optionen wie "Bewegung reduzieren", "Hochkontrastmodus" und anpassbare Schriftgrößen.
    -   **Vollständige Internationalisierung**: Die gesamte Anwendung ist ins Englische und Deutsche übersetzt.

## <a name="erste-schritte-de"></a>Erste Schritte
Der einfachste Weg, diese Anwendung auszuführen, ist direkt in AI Studio über den oben angegebenen Link.

### Umgebungsvariablen
Um die KI-gestützten Funktionen nutzen zu können, müssen Sie einen Google Gemini API-Schlüssel angeben.
-   `API_KEY`: Ihr Google Gemini API-Schlüssel.

Dieser Schlüssel wird als Umgebungsvariable im Ausführungskontext erwartet (z. B. im Geheimnis-Manager von AI Studio).

## <a name="projektstruktur-de"></a>Projektstruktur
```
/
├── App.tsx
├── README.md
├── components/
│   ├── (Wiederverwendbare UI-Komponenten)
│   ├── ai-archive/
│   ├── audiothek/
│   ├── library/
│   ├── scriptorium/
│   ├── settings/
│   └── uploader/
├── contexts/
├── hooks/
├── locales/ (en/, de/)
├── pages/ (Alle Hauptansichten)
├── services/
├── store/ (Jotai-Atome)
├── utils/
└── ... (Konfigurationsdateien)
```

## <a name="lizenz-de"></a>Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert.