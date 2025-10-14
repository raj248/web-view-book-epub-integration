# Web View Book EPUB Integration

This repository provides the WebView integration layer for rendering EPUB books inside React Native apps.  
It connects native React Native logic (e.g., chapter navigation, highlights, gestures) with the web-based EPUB renderer.

## ✨ Features

- 📖 Renders EPUB content inside a WebView
- 🔄 Supports React Native ↔ WebView communication via `postMessage`
- 🎚️ Smooth swipe and scroll behavior with touch-friendly gestures
- ⚡ Optimized for large EPUB files with lazy loading
- 🎨 Customizable UI integration for book readers

## 🧩 Typical Use Case

Used in EPUB reader projects (e.g., **Lexicon Hub**) to provide:

- Chapter rendering
- Gesture-based navigation
- Bookmarks, highlights, and annotations (future support)

## 🚀 Tech Stack

- **HTML5 / CSS / JavaScript**
- **EPUB.js**
- **React Native WebView**

## 🛠️ Example Integration

```tsx
import { WebView } from "react-native-webview";

<WebView
  source={{ uri: "path/to/epub-viewer/index.html" }}
  onMessage={handleMessage}
  injectedJavaScript={injectedJS}
/>;
```
