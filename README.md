# Internet Archive Explorer

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/) [![Jotai](https://img.shields.io/badge/Jotai-2.x-blue)](https://jotai.org/) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue?logo=tailwindcss)](https://tailwindcss.com/) [![Gemini AI](https://img.shields.io/badge/AI-Gemini-blue?logo=google)](https://ai.google.dev/)

**Ein hochentwickeltes Webportal zur Erkundung der riesigen Sammlung des Internet Archive.** Diese Anwendung kombiniert eine moderne, reaktionsschnelle Benutzeroberfläche mit leistungsstarken Entdeckungswerkzeugen, persönlichen Forschungsbereichen und KI-gestützten Analysefunktionen.

## Live-Demo & Code in AI Studio

Diese Anwendung wurde in **AI Studio** entwickelt und wird dort gehostet, einer leistungsstarken webbasierten Entwicklungsumgebung für das Prototyping und die Erstellung von KI-integrierten Anwendungen.

**[Entdecken und forken Sie dieses Projekt in AI Studio](https://ai.studio/apps/drive/1GWHcbnmh7qZKnqj_rXUyrQYBzkoCJ4E-)**

Über den obigen Link können Sie auf den vollständigen Quellcode zugreifen, mit Änderungen experimentieren und sogar Ihre eigene Version dieser Anwendung bereitstellen.

---

## Inhaltsverzeichnis
- [Kernfunktionen](#kernfunktionen)
  - [Einheitliche Entdeckungs-Engine](#einheitliche-entdeckungs-engine)
  - [Kuratierte Inhalts-Hubs](#kuratierte-inhalts- hubs)
  - [Umfassende Profile von Mitwirkenden](#umfassende-profile-von-mitwirkenden)
  - [Meine Bibliothek: Ein persönlicher Kurationsraum](#meine-bibliothek-ein-persönlicher-kurationsraum)
  - [Das Scriptorium: Ein Arbeitsbereich für Forschende](#das-scriptorium-ein-arbeitsbereich-für-forschende)
  - [KI-gestützte Einblicke (mit Gemini)](#ki-gestützte-einblicke-mit-gemini)
  - [Power-User-Tools & Barrierefreiheit](#power-user-tools--barrierefreiheit)
- [Technischer Einblick](#technischer-einblick)
  - [Technologie-Stack](#technologie-stack)
  - [State Management](#state-management)
  - [Performance-Engineering](#performance-engineering)
  - [Barrierefreiheit (A11y)](#barrierefreiheit-a11y)
- [Erste Schritte](#erste-schritte)
- [Projektstruktur](#projektstruktur)
- [Lizenz](#lizenz)

## Kernfunktionen

### Einheitliche Entdeckungs-Engine
-   **Dynamischer Explorer-Hub**: Die Hauptseite bietet ein reichhaltiges Entdeckungserlebnis mit Karussells für "Aktuelle Trends" und historische Inhalte von "An diesem Tag".
-   **Universelle Suche**: Eine persistente Suchleiste im Header ermöglicht schnelle Abfragen von jeder Seite der Anwendung aus.
-   **Erweiterte Filterung**: Verfeinern Sie die Suchergebnisse präzise nach Medientyp, Jahresbereich, Sammlung und mehr.

### Kuratierte Inhalts-Hubs
Spezialisierte Bereiche für ein fokussiertes Browsing-Erlebnis:
-   **Videothek**: Durchsuchen Sie klassische Filme, Film Noir und Science-Fiction in ansprechenden, scrollbaren Karussells.
-   **Audiothek**: Entdecken Sie Live-Musik, alte Radiosendungen und Hörbücher.
-   **Bilder-Hub**: Erkunden Sie historische Fotos, Kunst von Museen wie dem Met und wissenschaftliche Bilder der NASA.
-   **Rec Room**: Spielen Sie Tausende von klassischen MS-DOS-Spielen und Software direkt im Browser per Emulation.
-   **Storyteller**: Ein interaktives, KI-gestütztes Tool, das auf der Grundlage Ihrer Eingaben einzigartige Kurzgeschichten erstellt.

### Umfassende Profile von Mitwirkenden
-   **Detaillierte Profilseiten**: Entdecken Sie die Personen und Institutionen hinter den Inhalten. Navigieren Sie direkt von jedem Element zu den Profilen der Uploader oder Ersteller.
-   **Dynamische Inhalts-Tabs**: Jedes Profil ist ein dynamisches Dashboard der Aktivitäten des Mitwirkenden. Tabs für **Uploads, Sammlungen, Favoriten, Rezensionen, Forenbeiträge** und **Web-Archive** erscheinen automatisch nur dann, wenn der Benutzer Inhalte in dieser Kategorie hat.
-   **Leistungsstarke Upload-Filterung**: Der Haupt-Tab "Uploads" ist ein interaktives Archiv für sich. Er verfügt über ein integriertes Bedienfeld, mit dem Sie alle Uploads eines Mitwirkenden nach Medientyp filtern und nach Kriterien wie Beliebtheit oder Veröffentlichungsdatum sortieren können.

### Meine Bibliothek: Ein persönlicher Kurationsraum
Ein zentraler Hub für alle Ihre gespeicherten Inhalte und Mitwirkenden, organisiert in einem Drei-Fenster-Layout:
-   **Sammlungen & Tags**: Organisieren Sie gespeicherte Elemente in benutzerdefinierten Sammlungen oder filtern Sie sie nach Tags, die Sie zugewiesen haben.
-   **Gegenstandsliste**: Verwalten Sie Ihre gespeicherten Elemente mit einer erweiterten Oberfläche, die Suche, Filterung und Sortierung umfasst. Ein "Auswahlmodus" ermöglicht die gleichzeitige Auswahl mehrerer Elemente für Massenaktionen.
-   **Detailansicht & Notizen**: Sehen Sie Details zu einem ausgewählten Element, schreiben und speichern Sie persönliche Notizen und verwalten Sie Tags, ohne die Bibliotheksansicht zu verlassen.
-   **Gefolgte Uploader**: Sehen und durchsuchen Sie alle Mitwirkenden, denen Sie folgen, um schnellen Zugriff auf deren Arbeit zu haben.

### Das Scriptorium: Ein Arbeitsbereich für Forschende
-   **Persönliche Worksets**: Ein persönlicher Arbeitsbereich für textbasierte Forschung. Gruppieren Sie Dokumente aus dem Archiv in "Worksets", um Ihre Projekte zu organisieren.
-   **Integrierter Reader & KI-Tools**: Das Scriptorium verfügt über einen integrierten Dokumentenleser mit leistungsstarken Werkzeugen, die von der **Google Gemini API** angetrieben werden.
-   **Persistente Notizen**: Schreiben und speichern Sie persönliche Notizen für jedes Dokument innerhalb eines Worksets.

### KI-gestützte Einblicke (mit Gemini)
-   **KI-Zusammenfassung**: Generieren Sie auf Abruf prägnante Zusammenfassungen langer Texte mit einstellbaren Tonalitäten (einfach, detailliert, akademisch).
-   **Entitätenextraktion**: Identifizieren und kennzeichnen Sie automatisch Personen, Orte, Organisationen und Daten in Texten, um weitere Entdeckungen zu fördern.
-   **Kreatives Geschichtenerzählen**: Nutzen Sie das Storyteller-Tool, um fesselnde Erzählungen basierend auf Ihren Ideen zu erstellen.

### Power-User-Tools & Barrierefreiheit
-   **Umfassende Einstellungen**: Passen Sie Ihr Erlebnis mit detaillierten Einstellungen für Design, Sprache, Suche, Inhaltsverhalten und KI-Funktionen an.
-   **Befehlspalette (Cmd/Ctrl + K)**: Navigieren Sie sofort zu jedem Bereich, ändern Sie Einstellungen oder führen Sie Aktionen mit nur wenigen Tastenanschlägen aus.
-   **Datenverwaltung**: Exportieren und importieren Sie alle Ihre Benutzerdaten (Einstellungen, Favoriten, Worksets) als einzelne JSON-Datei zur Sicherung und Migration.
-   **Barrierefreiheit im Fokus**: Die Anwendung wurde unter Berücksichtigung der Barrierefreiheit entwickelt und bietet ARIA-Attribute, Fokusverwaltung für Modalfenster und vom Benutzer konfigurierbare Optionen wie Hochkontrastmodus und reduzierte Bewegung.

## Technischer Einblick

### Technologie-Stack
-   **Frontend**: [React 19](https://react.dev/) mit Hooks
-   **Sprache**: [TypeScript](https://www.typescriptlang.org/)
-   **State Management**: [Jotai](https://jotai.org/) für atomaren, performanten globalen Zustand.
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) für ein Utility-First-CSS-Framework.
-   **KI**: [Google Gemini API](https://ai.google.dev/) über das `@google/genai` SDK.
-   **Build-Tool**: [Vite](https://vitejs.dev/) für schnelle und optimierte Entwicklung und Builds.

### State Management
Jotai wurde aufgrund seines atomaren Ansatzes gewählt. Dies ermöglicht ein hochgradig optimiertes Rerendering, da Komponenten nur die spezifischen Zustandsatome abonnieren, die sie benötigen. Dies führt zu einer deutlich besseren Leistung im Vergleich zu traditionellen, monolithischen State-Stores, insbesondere in einer komplexen Anwendung wie dieser.

### Performance-Engineering
-   **Code Splitting**: Jede Hauptansicht wird mit `React.lazy` in einen eigenen Chunk aufgeteilt, um eine schnelle anfängliche Ladezeit der Seite zu gewährleisten.
-   **Debouncing**: `useDebounce` wird auf Sucheingaben angewendet, um übermäßige API-Aufrufe während der Eingabe durch den Benutzer zu verhindern.
-   **Virtualisierung**: `useInfiniteScroll` sorgt für ein reibungsloses Erlebnis beim Durchsuchen langer Ergebnislisten.
-   **Memoization**: `React.memo`, `useCallback` und `useMemo` werden gezielt eingesetzt, um unnötige Rerenderings von Komponenten und Neuberechnungen von Werten zu verhindern.

### Barrierefreiheit (A11y)
-   **Semantisches HTML & ARIA**: Korrekte Verwendung von ARIA-Rollen und -Attributen.
-   **Fokus-Management**: Der `useModalFocusTrap`-Hook fängt den Fokus korrekt in Modalfenstern ein.
-   **Benutzereinstellungen**: Inklusive Optionen wie "Bewegung reduzieren", "Hochkontrastmodus" und anpassbare Schriftgrößen.

## Erste Schritte
Der einfachste Weg, diese Anwendung auszuführen, ist direkt in AI Studio über den oben angegebenen Link.

### Umgebungsvariablen
Um die KI-gestützten Funktionen nutzen zu können, müssen Sie einen Google Gemini API-Schlüssel angeben.
-   `API_KEY`: Ihr Google Gemini API-Schlüssel.

Dieser Schlüssel wird als Umgebungsvariable im Ausführungskontext erwartet (z. B. im Geheimnis-Manager von AI Studio).

## Projektstruktur
Das Projekt ist zur einfachen Navigation in logische Verzeichnisse gegliedert:
-   `/components`: Wiederverwendbare React-Komponenten (z. B. `ItemCard`, `Header`).
-   `/contexts`: React-Kontext-Provider für übergreifende Anliegen (z. B. `ToastContext`).
-   `/hooks`: Benutzerdefinierte React-Hooks für gemeinsam genutzte Logik (z. B. `useDebounce`, `useInfiniteScroll`).
-   `/pages`: Komponenten auf oberster Ebene, die eine vollständige Seite oder Hauptansicht darstellen.
-   `/services`: Module für die Interaktion mit externen APIs (`archiveService.ts`, `geminiService.ts`).
-   `/store`: Jotai-Atom-Definitionen, nach Feature-Slice organisiert.
-   `/utils`: Hilfsfunktionen für Formatierung, Abfrageerstellung usw.
-   `/locales`: Enthält Sprachunterverzeichnisse (`/en`, `/de`) mit JSON-Dateien für die Internationalisierung.

## Lizenz
Dieses Projekt ist unter der MIT-Lizenz lizenziert.
