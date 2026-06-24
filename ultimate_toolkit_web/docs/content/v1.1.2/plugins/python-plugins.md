# Python Plugins

Starting from v1.1.0, Ultimate Toolkit can run **Python scripts as native plugins**. This allows you to use the entire Python ecosystem — PySide6 for GUI, pytesseract for OCR, machine learning models, and more.

## How It Works

The app launches Python scripts as child processes via Tauri's Rust backend. The backend:
1. Automatically finds Python on your system (checks common install paths)
2. Resolves the plugin script from the app's bundled resources
3. Spawns the Python process and tracks it by plugin ID
4. Kills the process when the plugin is deactivated

## Built-in: Python OCR Plugin

The Python OCR plugin (`OCR (Python)` in the Plugin Manager) demonstrates this capability:

- **Standalone PySide6 window** with image overlay and word selection
- **Drag-select** — click and drag to select multiple words
- **Ctrl+toggle** — Ctrl+click or Ctrl+drag to toggle individual words
- **Image View** — toggle between raw text and image overlay modes
- **Copy Selected** — copy only the words you selected

### Requirements

The Python OCR plugin requires:
- **Python 3.10+** installed on your system
- **PySide6** — `pip install PySide6`
- **pytesseract** — `pip install pytesseract`
- **Pillow** — `pip install Pillow`
- **Tesseract OCR** — installed at `C:\Program Files\Tesseract-OCR\`

## Creating Your Own Python Plugin

Python plugins follow the same PluginBase pattern as regular plugins, but use `PythonPluginBase`:

```typescript
// src/plugins/my_python_plugin/index.tsx
import { PythonPluginBase } from "../core/PythonPluginBase";

const definition = {
  id: "my-python-plugin",
  name: "My Python Plugin",
  description: "A Python-powered plugin with PySide6 UI",
  icon: "🐍",
  version: "0.1.0",
  author: "You",
  hasFloatingUI: false,
};

export class MyPythonPlugin extends PythonPluginBase {
  definition = definition;
  pythonPluginId = "my_python_script"; // matches {pythonPluginId}.py
}
```

The Python script `plugins/python/my_python_script.py` must be a standalone script that creates its own `QApplication` and window:

```python
import sys
from PySide6.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel

class MyPluginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('My Python Plugin')
        self.resize(400, 300)
        layout = QVBoxLayout(self)
        layout.addWidget(QLabel('Hello from Python!'))

if __name__ == '__main__':
    app = QApplication(sys.argv)
    win = MyPluginWindow()
    win.show()
    sys.exit(app.exec())
```

Place your script at `plugins/python/{pluginId}.py` in the project root.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Ultimate Toolkit                      │
│  ┌──────────────┐          ┌─────────────────────────┐  │
│  │  React/TS    │  invoke  │      Rust (Tauri)        │  │
│  │  PluginBase  │ ────────→│  launch_python_plugin()  │  │
│  │  onActivate  │          │  ┌─────────────────────┐ │  │
│  │  onDeactivate│          │  │ HashMap<String,     │ │  │
│  └──────────────┘          │  │ Child>              │ │  │
│                            │  └─────────────────────┘ │  │
│                            │         │ spawn          │  │
│                            └─────────│────────────────┘  │
└──────────────────────────────────────│───────────────────┘
                                       ▼
                       ┌─────────────────────────────┐
                       │    Python Process            │
                       │  QApplication + PySide6 GUI  │
                       │  (independent window)        │
                       └─────────────────────────────┘
```

When the user activates the plugin, the Rust backend spawns `python {script_path}`. Deactivation sends a kill signal. The Python window operates fully independently.
