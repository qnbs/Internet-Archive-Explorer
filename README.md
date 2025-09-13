# Internet Archive Explorer
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/qnbs/Internet-Archive-Explorer)

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/)

**An advanced web portal for exploring the vast collection of the Internet Archive.** This application combines a modern, responsive user interface with powerful discovery tools, personal research spaces, and AI-powered analysis features.

### Live Demo & Code in AI Studio

This application was developed and is hosted in **AI Studio**, a powerful web-based development environment for prototyping and building AI-integrated applications.

**[Explore and fork this project in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Via the link above, you can access the full source code, experiment with changes, and even deploy your own version of this application.

---

## Table of Contents
- [Core Features](#core-features)
  - [Unified Discovery Engine](#unified-discovery-engine)
  - [Curated Content Hubs](#curated-content-hubs)
  - [Comprehensive Contributor Profiles](#comprehensive-contributor-profiles)
  - [My Library: A Personal Curation Space](#my-library-a-personal-curation-space)
  - [The Scriptorium: A Researcher's Workspace](#the-scriptorium-a-researchers-workspace)
  - [AI-Powered Insights (with Gemini)](#ai-powered-insights-with-gemini)
  - [Enhanced Media Viewers](#enhanced-media-viewers)
  - [Power-User Tools & Accessibility](#power-user-tools--accessibility)
- [Technical Deep-Dive](#technical-deep-dive)
  - [Technology Stack](#technology-stack)
  - [State Management](#state-management)
  - [Performance Engineering](#performance-engineering)
  - [Accessibility (A11y)](#accessibility-a11y)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [License](#license)

---

## Core Features

### Unified Discovery Engine
-   **Dynamic Explorer Hub**: The main page offers a rich discovery experience with carousels for "Trending Now" and historical "On This Day" content, including an AI-generated "Daily Insight" that connects trending items.
-   **Universal Search**: A persistent header search bar allows for quick queries from any part of the application.
-   **Advanced Filtering**: Precisely refine search results by media type, year range, collection, language, and content availability (free vs. borrowable).

### Curated Content Hubs
Specialized sections for a focused browsing experience:
-   **Videothek**: Browse classic movies, film noir, and sci-fi in engaging, scrollable carousels.
-   **Audiothek**: Discover live music, old-time radio shows, and audiobooks.
-   **Images Hub**: Explore historical photos, art from museums like The Met, and scientific imagery from NASA.
-   **Rec Room**: Play thousands of classic MS-DOS games and software directly in the browser via emulation.
-   **Storyteller**: An interactive, AI-powered tool that generates unique short stories based on your prompts.

### Comprehensive Contributor Profiles
-   **Detailed Profile Pages**: Explore the people and institutions behind the content. Navigate directly to uploader or creator profiles from any item.
-   **My Archive**: Connect your own public Internet Archive account to use the profile view as a personal dashboard for your own contributions, stats, and activity.
-   **Dynamic Content Tabs**: Each profile is a dynamic dashboard of the contributor's activity. Tabs for **Uploads, Collections, Favorites, Reviews, Forum Posts,** and **Web Archives** automatically appear only if the user has content in that category.
-   **Powerful Upload Filtering**: The main "Uploads" tab is an interactive archive in its own right, featuring a built-in control panel to filter all of a contributor's uploads by media type and sort by criteria like popularity or publication date.

### My Library: A Personal Curation Space
A central hub for all your saved items and followed contributors, organized in a three-pane layout:
-   **Collections & Tags**: Organize saved items into custom collections or filter them by tags you've assigned.
-   **Item List**: Manage your saved items with an advanced interface that includes search, filtering, and sorting. A "Select Mode" allows for batch-selecting items for bulk actions.
-   **Detail Pane & Notes**: View details of a selected item, write and save personal notes (with rich text formatting), and manage tags without leaving the library view.
-   **AI-Powered Organization**: Use "Magic Organize" to get AI-powered suggestions for tags and new collections based on a selection of your items.
-   **Followed Uploaders**: View and search all the contributors you follow for quick access to their work.

### The Scriptorium: A Researcher's Workspace
-   **Personal Worksets**: A personal workspace for text-based research. Group documents from the archive into "Worksets" to organize your projects.
-   **Integrated Reader & AI Tools**: The Scriptorium features a two-panel resizable view with an integrated document reader and a rich text editor for notes. It's enhanced with powerful tools powered by the **Google Gemini API**.
-   **Persistent Notes**: Write and save personal notes for each document within a workset using a rich text editor.

### AI-Powered Insights (with Gemini)
-   **AI Summarization**: On-demand, generate concise summaries of long texts with adjustable tones (simple, detailed, academic).
-   **Entity Extraction**: Automatically identify and tag people, places, organizations, and dates within texts to aid further discovery.
-   **Contextual Q&A**: Ask questions about a document in the Scriptorium and receive answers based solely on the provided text.
-   **Multi-turn Image Analysis**: After an initial automated analysis, engage in a conversation with the AI by asking follow-up questions about an image to get more specific details.
-   **Magic Organization**: Select multiple items in your library and get AI suggestions for relevant tags and new collection names.
-   **Daily Historical Insight**: The Explorer Hub features a daily, AI-generated blurb that creatively connects the day's trending items.
-   **Creative Storytelling**: Use the Storyteller tool to generate engaging narratives based on your ideas.

### Enhanced Media Viewers
-   **Advanced Image Viewer**: A fully-featured, in-modal image viewer with smooth zoom (mouse-wheel controlled), panning, rotation, fullscreen mode, and direct download capabilities.
-   **Keyboard Shortcuts**: The image viewer is fully controllable via the keyboard (`+`/`-` for zoom, `r` to rotate, `0` to reset) for power users.
-   **Embedded Players**: Seamlessly play emulated software, read books in the Archive's BookReader, and listen to audio previews directly within modal views.

### Power-User Tools & Accessibility
-   **Comprehensive Settings**: Tailor your experience with granular settings for appearance, language, search, content behavior, and AI features.
-   **Command Palette (Cmd/Ctrl + K)**: Instantly navigate to any section, change settings, or perform actions with a few keystrokes.
-   **Data Management**: Export and import all your user data (settings, library, worksets) as a single JSON file for backup and migration.
-   **Accessibility-Focused**: Built with accessibility in mind, featuring ARIA attributes, focus management for modals, and user-configurable options like high-contrast mode and reduced motion.

## Technical Deep-Dive

### Technology Stack
-   **Frontend**: [React 19](https://react.dev/) with Hooks
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) for atomic, performant global state.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
-   **AI**: [Google Gemini API](https://ai.google.dev/) via the `@google/genai` SDK.
-   **Build Tool**: [Vite](https://vitejs.dev/) for fast and optimized development and builds.

### State Management
Jotai was chosen for its atomic approach. This allows for highly optimized re-renders, as components subscribe only to the specific atoms of state they need. This results in significantly better performance compared to traditional monolithic state stores, especially in a complex application like this.

### Performance Engineering
-   **Code Splitting**: Each main view is split into its own chunk using `React.lazy` to ensure a fast initial page load.
-   **Debouncing**: `useDebounce` is applied to search inputs to prevent excessive API calls while the user is typing.
-   **Infinite Scrolling**: `useInfiniteScroll` provides a smooth experience when browsing long lists of results.
-   **Memoization**: `React.memo`, `useCallback`, and `useMemo` are used strategically to prevent unnecessary component re-renders and value recalculations.

### Accessibility (A11y)
-   **Semantic HTML & ARIA**: Proper use of ARIA roles and attributes throughout the application.
-   **Focus Management**: The `useModalFocusTrap` hook correctly traps focus within modals.
-   **User Settings**: Includes options like "Reduce Motion," "High Contrast Mode," and adjustable font sizes.

## Getting Started
The easiest way to run this application is directly in AI Studio via the link provided at the top.

### Environment Variables
To use the AI-powered features, you must provide a Google Gemini API key.
-   `API_KEY`: Your Google Gemini API Key.

This key is expected as an environment variable in the execution context (e.g., AI Studio's secrets manager).

## Project Structure
The project is organized into logical directories for easy navigation:
-   `/components`: Reusable React components (e.g., `ItemCard`, `Header`).
-   `/contexts`: React Context providers for cross-cutting concerns (e.g., `ToastContext`).
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

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/)

**Ein hochentwickeltes Webportal zur Erkundung der riesigen Sammlung des Internet Archive.** Diese Anwendung kombiniert eine moderne, reaktionsschnelle Benutzeroberfläche mit leistungsstarken Entdeckungswerkzeugen, persönlichen Forschungsbereichen und KI-gestützten Analysefunktionen.

### Live-Demo & Code in AI Studio

Diese Anwendung wurde in **AI Studio** entwickelt und wird dort gehostet, einer leistungsstarken webbasierten Entwicklungsumgebung für das Prototyping und die Erstellung von KI-integrierten Anwendungen.

**[Entdecken und forken Sie dieses Projekt in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Über den obigen Link können Sie auf den vollständigen Quellcode zugreifen, mit Änderungen experimentieren und sogar Ihre eigene Version dieser Anwendung bereitstellen.

---

## Inhaltsverzeichnis (Deutsch)
- [Kernfunktionen](#kernfunktionen-de)
  - [Einheitliche Entdeckungs-Engine](#einheitliche-entdeckungs-engine-de)
  - [Kuratierte Inhalts-Hubs](#kuratierte-inhalts-hubs-de)
  - [Umfassende Profile von Mitwirkenden](#umfassende-profile-von-mitwirkenden-de)
  - [Meine Bibliothek: Ein persönlicher Kurationsraum](#meine-bibliothek-ein-persönlicher-kurationsraum-de)
  - [Das Scriptorium: Ein Arbeitsbereich für Forschende](#das-scriptorium-ein-arbeitsbereich-für-forschende-de)
  - [KI-gestützte Einblicke (mit Gemini)](#ki-gestützte-einblicke-mit-gemini-de)
  - [Erweiterte Medienbetrachter](#erweiterte-medienbetrachter-de)
  - [Power-User-Tools & Barrierefreiheit](#power-user-tools--barrierefreiheit-de)
- [Technischer Einblick](#technischer-einblick-de)
  - [Technologie-Stack](#technologie-stack-de)
  - [State Management](#state-management-de)
  - [Performance-Engineering](#performance-engineering-de)
  - [Barrierefreiheit (A11y)](#barrierefreiheit-a11y-de)
- [Erste Schritte](#erste-schritte-de)
- [Projektstruktur](#projektstruktur-de)
- [Lizenz](#lizenz-de)

---

## <a name="kernfunktionen-de"></a>Kernfunktionen

### <a name="einheitliche-entdeckungs-engine-de"></a>Einheitliche Entdeckungs-Engine
-   **Dynamischer Explorer-Hub**: Die Hauptseite bietet ein reichhaltiges Entdeckungserlebnis mit Karussells für "Aktuelle Trends" und historische Inhalte von "An diesem Tag", einschließlich eines KI-generierten "Täglichen Einblicks", der Trend-Elemente verbindet.
-   **Universelle Suche**: Eine persistente Suchleiste im Header ermöglicht schnelle Abfragen von jeder Seite der Anwendung aus.
-   **Erweiterte Filterung**: Verfeinern Sie die Suchergebnisse präzise nach Medientyp, Jahresbereich, Sammlung, Sprache und Verfügbarkeit (frei vs. ausleihbar).

### <a name="kuratierte-inhalts-hubs-de"></a>Kuratierte Inhalts-Hubs
Spezialisierte Bereiche für ein fokussiertes Browsing-Erlebnis:
-   **Videothek**: Durchsuchen Sie klassische Filme, Film Noir und Science-Fiction in ansprechenden, scrollbaren Karussells.
-   **Audiothek**: Entdecken Sie Live-Musik, alte Radiosendungen und Hörbücher.
-   **Bilder-Hub**: Erkunden Sie historische Fotos, Kunst von Museen wie dem Met und wissenschaftliche Bilder der NASA.
-   **Rec Room**: Spielen Sie Tausende von klassischen MS-DOS-Spielen und Software direkt im Browser per Emulation.
-   **Storyteller**: Ein interaktives, KI-gestütztes Tool, das auf der Grundlage Ihrer Eingaben einzigartige Kurzgeschichten erstellt.

### <a name="umfassende-profile-von-mitwirkenden-de"></a>Umfassende Profile von Mitwirkenden
-   **Detaillierte Profilseiten**: Entdecken Sie die Personen und Institutionen hinter den Inhalten. Navigieren Sie direkt von jedem Element zu den Profilen der Uploader oder Ersteller.
-   **Mein Archiv**: Verbinden Sie Ihr eigenes öffentliches Internet Archive-Konto, um die Profilansicht als persönliches Dashboard für Ihre eigenen Beiträge, Statistiken und Aktivitäten zu nutzen.
-   **Dynamische Inhalts-Tabs**: Jedes Profil ist ein dynamisches Dashboard der Aktivitäten des Mitwirkenden. Tabs für **Uploads, Sammlungen, Favoriten, Rezensionen, Forenbeiträge** und **Web-Archive** erscheinen automatisch nur dann, wenn der Benutzer Inhalte in dieser Kategorie hat.
-   **Leistungsstarke Upload-Filterung**: Der Haupt-Tab "Uploads" ist ein interaktives Archiv für sich. Er verfügt über ein integriertes Bedienfeld, mit dem Sie alle Uploads eines Mitwirkenden nach Medientyp filtern und nach Kriterien wie Beliebtheit oder Veröffentlichungsdatum sortieren können.

### <a name="meine-bibliothek-ein-persönlicher-kurationsraum-de"></a>Meine Bibliothek: Ein persönlicher Kurationsraum
Ein zentraler Hub für alle Ihre gespeicherten Inhalte und Mitwirkenden, organisiert in einem Drei-Fenster-Layout:
-   **Sammlungen & Tags**: Organisieren Sie gespeicherte Elemente in benutzerdefinierten Sammlungen oder filtern Sie sie nach Tags, die Sie zugewiesen haben.
-   **Gegenstandsliste**: Verwalten Sie Ihre gespeicherten Elemente mit einer erweiterten Oberfläche, die Suche, Filterung und Sortierung umfasst. Ein "Auswahlmodus" ermöglicht die gleichzeitige Auswahl mehrerer Elemente für Massenaktionen.
-   **Detailansicht & Notizen**: Sehen Sie Details zu einem ausgewählten Element, schreiben und speichern Sie persönliche Notizen (mit Rich-Text-Formatierung) und verwalten Sie Tags, ohne die Bibliotheksansicht zu verlassen.
-   **KI-gestützte Organisation**: Nutzen Sie "Magisch Organisieren", um KI-gestützte Vorschläge für Tags und neue Sammlungsnamen basierend auf einer Auswahl Ihrer Elemente zu erhalten.
-   **Gefolgte Uploader**: Sehen und durchsuchen Sie alle Mitwirkenden, denen Sie folgen, um schnellen Zugriff auf deren Arbeit zu haben.

### <a name="das-scriptorium-ein-arbeitsbereich-für-forschende-de"></a>Das Scriptorium: Ein Arbeitsbereich für Forschende
-   **Persönliche Worksets**: Ein persönlicher Arbeitsbereich für textbasierte Forschung. Gruppieren Sie Dokumente aus dem Archiv in "Worksets", um Ihre Projekte zu organisieren.
-   **Integrierter Reader & KI-Tools**: Das Scriptorium verfügt über eine zweigeteilte, anpassbare Ansicht mit einem integrierten Dokumentenleser und einem Rich-Text-Editor für Notizen. Es wird durch leistungsstarke Werkzeuge erweitert, die von der **Google Gemini API** angetrieben werden.
-   **Persistente Notizen**: Schreiben und speichern Sie persönliche Notizen für jedes Dokument innerhalb eines Worksets mit einem Rich-Text-Editor.

### <a name="ki-gestützte-einblicke-mit-gemini-de"></a>KI-gestützte Einblicke (mit Gemini)
-   **KI-Zusammenfassung**: Generieren Sie auf Abruf prägnante Zusammenfassungen langer Texte mit einstellbaren Tonalitäten (einfach, detailliert, akademisch).
-   **Entitätenextraktion**: Identifizieren und kennzeichnen Sie automatisch Personen, Orte, Organisationen und Daten in Texten, um weitere Entdeckungen zu fördern.
-   **Kontextbezogene F&A**: Stellen Sie Fragen zu einem Dokument im Scriptorium und erhalten Sie Antworten, die ausschließlich auf dem bereitgestellten Text basieren.
-   **Multimodale Bildanalyse**: Führen Sie nach einer ersten automatisierten Analyse ein Gespräch mit der KI, indem Sie Folgefragen zu einem Bild stellen, um spezifischere Details zu erhalten.
-   **Magische Organisation**: Wählen Sie mehrere Elemente in Ihrer Bibliothek aus und erhalten Sie KI-Vorschläge für relevante Tags und neue Sammlungsnamen.
-   **Täglicher historischer Einblick**: Der Explorer-Hub bietet einen täglichen, KI-generierten Kurztext, der die Trend-Elemente des Tages kreativ verbindet.
-   **Kreatives Geschichtenerzählen**: Nutzen Sie das Storyteller-Tool, um fesselnde Erzählungen basierend auf Ihren Ideen zu erstellen.

### <a name="erweiterte-medienbetrachter-de"></a>Erweiterte Medienbetrachter
-   **Fortschrittlicher Bildbetrachter**: Ein voll ausgestatteter, in das Modal integrierter Bildbetrachter mit stufenlosem Zoom (per Mausrad), Schwenken, Rotation, Vollbildmodus und direkten Download-Möglichkeiten.
-   **Tastaturkürzel**: Der Bildbetrachter ist für Power-User vollständig über die Tastatur steuerbar (`+`/`-` für Zoom, `r` zum Drehen, `0` zum Zurücksetzen).
-   **Eingebettete Player**: Spielen Sie emulierte Software nahtlos ab, lesen Sie Bücher im BookReader des Archivs und hören Sie Audiovorschauen direkt in den Modalansichten.

### <a name="power-user-tools--barrierefreiheit-de"></a>Power-User-Tools & Barrierefreiheit
-   **Umfassende Einstellungen**: Passen Sie Ihr Erlebnis mit detaillierten Einstellungen für Design, Sprache, Suche, Inhaltsverhalten und KI-Funktionen an.
-   **Befehlspalette (Cmd/Ctrl + K)**: Navigieren Sie sofort zu jedem Bereich, ändern Sie Einstellungen oder führen Sie Aktionen mit nur wenigen Tastenanschlägen aus.
-   **Datenverwaltung**: Exportieren und importieren Sie alle Ihre Benutzerdaten (Einstellungen, Bibliothek, Worksets) als einzelne JSON-Datei zur Sicherung und Migration.
-   **Barrierefreiheit im Fokus**: Die Anwendung wurde unter Berücksichtigung der Barrierefreiheit entwickelt und bietet ARIA-Attribute, Fokusverwaltung für Modalfenster und vom Benutzer konfigurierbare Optionen wie Hochkontrastmodus und reduzierte Bewegung.

## <a name="technischer-einblick-de"></a>Technischer Einblick

### <a name="technologie-stack-de"></a>Technologie-Stack
-   **Frontend**: [React 19](https://react.dev/) mit Hooks
-   **Sprache**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) für atomaren, performanten globalen Zustand.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) für ein Utility-First-CSS-Framework.
-   **KI**: [Google Gemini API](https://ai.google.dev/) über das `@google/genai` SDK.
-   **Build-Tool**: [Vite](https://vitejs.dev/) für schnelle und optimierte Entwicklung und Builds.

### <a name="state-management-de"></a>State Management
Jotai wurde aufgrund seines atomaren Ansatzes gewählt. Dies ermöglicht ein hochgradig optimiertes Rerendering, da Komponenten nur die spezifischen Zustandsatome abonnieren, die sie benötigen. Dies führt zu einer deutlich besseren Leistung im Vergleich zu traditionellen, monolithischen State-Stores, insbesondere in einer komplexen Anwendung wie dieser.

### <a name="performance-engineering-de"></a>Performance-Engineering
-   **Code Splitting**: Jede Hauptansicht wird mit `React.lazy` in einen eigenen Chunk aufgeteilt, um eine schnelle anfängliche Ladezeit der Seite zu gewährleisten.
-   **Debouncing**: `useDebounce` wird auf Sucheingaben angewendet, um übermäßige API-Aufrufe während der Eingabe durch den Benutzer zu verhindern.
-   **Infinite Scrolling**: `useInfiniteScroll` sorgt für ein reibungsloses Erlebnis beim Durchsuchen langer Ergebnislisten.
-   **Memoization**: `React.memo`, `useCallback` und `useMemo` werden gezielt eingesetzt, um unnötige Rerenderings von Komponenten und Neuberechnungen von Werten zu verhindern.

### <a name="barrierefreiheit-a11y-de"></a>Barrierefreiheit (A11y)
-   **Semantisches HTML & ARIA**: Korrekte Verwendung von ARIA-Rollen und -Attributen.
-   **Fokus-Management**: Der `useModalFocusTrap`-Hook fängt den Fokus korrekt in Modalfenstern ein.
-   **Benutzereinstellungen**: Inklusive Optionen wie "Bewegung reduzieren", "Hochkontrastmodus" und anpassbare Schriftgrößen.

## <a name="erste-schritte-de"></a>Erste Schritte
Der einfachste Weg, diese Anwendung auszuführen, ist direkt in AI Studio über den oben angegebenen Link.

### Umgebungsvariablen
Um die KI-gestützten Funktionen nutzen zu können, müssen Sie einen Google Gemini API-Schlüssel angeben.
-   `API_KEY`: Ihr Google Gemini API-Schlüssel.

Dieser Schlüssel wird als Umgebungsvariable im Ausführungskontext erwartet (z. B. im Geheimnis-Manager von AI Studio).

## <a name="projektstruktur-de"></a>Projektstruktur
Das Projekt ist zur einfachen Navigation in logische Verzeichnisse gegliedert:
-   `/components`: Wiederverwendbare React-Komponenten (z. B. `ItemCard`, `Header`).
-   `/contexts`: React-Kontext-Provider für übergreifende Anliegen (z. B. `ToastContext`).
-   `/hooks`: Benutzerdefinierte React-Hooks für gemeinsam genutzte Logik (z. B. `useDebounce`, `useInfiniteScroll`).
-   `/pages`: Komponenten auf oberster Ebene, die eine vollständige Seite oder Hauptansicht darstellen.
-   `/services`: Module für die Interaktion mit externen APIs (`archiveService.ts`, `geminiService.ts`).
-   `/store`: Jotai-Atom-Definitionen, nach Feature-Slice organisiert.
-   `/utils`: Hilfsfunktionen für Formatierung, Abfrageerstellung usw.
-   `/locales`: Enthält Sprachunterverzeichnisse (`/en`, `/de`) mit JSON-Dateien für die Internationalisierung.

## <a name="lizenz-de"></a>Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert.