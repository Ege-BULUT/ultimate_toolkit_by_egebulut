import os
import sys
import pytesseract
from PIL import Image, ImageGrab, ImageQt
from PySide6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
                               QTextEdit, QLabel, QFileDialog, QSizePolicy, QApplication)
from PySide6.QtCore import Qt, QThread, Signal, QRect, QRectF
from PySide6.QtGui import (QShortcut, QKeySequence, QPixmap, QPainter,
                           QPen, QColor, QFont, QMouseEvent)


class OCRWorker(QThread):
    finished = Signal(str, str, list)

    def __init__(self, image_path=None, image_data=None):
        super().__init__()
        self.image_path = image_path
        self.image_data = image_data

    def run(self):
        try:
            if self.image_data:
                if isinstance(self.image_data, Image.Image):
                    img = self.image_data
                else:
                    img = Image.open(self.image_data)
            else:
                img = Image.open(self.image_path)

            data = pytesseract.image_to_data(img, lang='eng', output_type=pytesseract.Output.DICT)
            text = data['text']
            texts = []
            boxes = []
            buf = ''
            for i, word in enumerate(text):
                if word.strip():
                    buf += word + ' '
                    conf = int(data['conf'][i]) if data['conf'][i] != '-1' else 0
                    if conf > 30:
                        boxes.append((
                            word,
                            data['left'][i], data['top'][i],
                            data['width'][i], data['height'][i],
                        ))
                elif buf.strip():
                    texts.append(buf.strip())
                    buf = ''
            if buf.strip():
                texts.append(buf.strip())

            self.finished.emit('\n'.join(texts), '', boxes)
        except Exception as e:
            self.finished.emit('', str(e), [])


class OCRLabel(QLabel):
    selectionChanged = Signal(object, bool)

    def __init__(self):
        super().__init__()
        self.boxes = []
        self.scale = 1.0
        self.offset_x = 0
        self.offset_y = 0
        self.pixmap_w = 0
        self.pixmap_h = 0
        self.setMouseTracking(True)
        self.hovered = -1
        self.drag_start = None
        self.drag_end = None
        self.selected_indices = set()

    def setBoxes(self, boxes, img_w, img_h):
        self.boxes = boxes
        self.pixmap_w = img_w
        self.pixmap_h = img_h

    def set_selected_indices(self, indices):
        self.selected_indices = set(indices)
        self.update()

    def paintEvent(self, event):
        super().paintEvent(event)
        if not self.pixmap() or not self.boxes:
            return

        pm = self.pixmap()
        pw, ph = pm.width(), pm.height()
        lw, lh = self.width(), self.height()
        self.scale = min(lw / pw, lh / ph) if pw > 0 and ph > 0 else 1.0
        self.offset_x = (lw - pw * self.scale) / 2
        self.offset_y = (lh - ph * self.scale) / 2

        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        font = QFont("Segoe UI", 9)
        painter.setFont(font)

        for i, (word, x, y, w, h) in enumerate(self.boxes):
            rx = int(self.offset_x + x * self.scale)
            ry = int(self.offset_y + y * self.scale)
            rw = int(w * self.scale)
            rh = int(h * self.scale)

            if i == self.hovered:
                painter.fillRect(QRect(rx, ry, rw, rh), QColor(233, 69, 96, 60))
                painter.setPen(QPen(QColor(233, 69, 96), 2))
            elif i in self.selected_indices:
                painter.fillRect(QRect(rx, ry, rw, rh), QColor(69, 96, 233, 50))
                painter.setPen(QPen(QColor(69, 96, 233), 2))
            else:
                painter.fillRect(QRect(rx, ry, rw, rh), QColor(233, 69, 96, 20))
                painter.setPen(QPen(QColor(233, 69, 96), 2))

            painter.drawRect(QRect(rx, ry, rw, rh))

        if self.drag_start and self.drag_end:
            x1, y1 = self.drag_start
            x2, y2 = self.drag_end
            xmin, xmax = min(x1, x2), max(x1, x2)
            ymin, ymax = min(y1, y2), max(y1, y2)
            painter.fillRect(QRectF(xmin, ymin, xmax - xmin, ymax - ymin), QColor(69, 96, 233, 30))
            painter.setPen(QPen(QColor(69, 96, 233), 1, Qt.DashLine))
            painter.drawRect(QRectF(xmin, ymin, xmax - xmin, ymax - ymin))

        painter.end()

    def mousePressEvent(self, event):
        if event.button() == Qt.LeftButton:
            self.drag_start = (event.position().x(), event.position().y())
            self.drag_end = self.drag_start
            self.update()

    def mouseMoveEvent(self, event):
        mx, my = event.position().x(), event.position().y()
        self.hovered = -1
        for i, (word, x, y, w, h) in enumerate(self.boxes):
            rx = int(self.offset_x + x * self.scale)
            ry = int(self.offset_y + y * self.scale)
            rw = int(w * self.scale)
            rh = int(h * self.scale)
            if rx <= mx <= rx + rw and ry <= my <= ry + rh:
                self.hovered = i
                break
        if self.drag_start is not None:
            self.drag_end = (mx, my)
        self.update()

    def mouseReleaseEvent(self, event):
        if event.button() == Qt.LeftButton and self.drag_start is not None:
            x1, y1 = self.drag_start
            x2, y2 = self.drag_end if self.drag_end else (x1, y1)
            xmin, xmax = min(x1, x2), max(x1, x2)
            ymin, ymax = min(y1, y2), max(y1, y2)

            selected_boxes = []
            for i, (word, x, y, w, h) in enumerate(self.boxes):
                bx = self.offset_x + x * self.scale
                by = self.offset_y + y * self.scale
                bw = w * self.scale
                bh = h * self.scale
                if bx < xmax and bx + bw > xmin and by < ymax and by + bh > ymin:
                    selected_boxes.append((word, x, y, w, h))

            self.drag_start = None
            self.drag_end = None

            ctrl = event.modifiers() & Qt.ControlModifier
            self.selectionChanged.emit(selected_boxes, bool(ctrl))
            self.update()


class OCRWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle('OCR - UToolkit (Python)')
        self.resize(700, 600)
        self.setAttribute(Qt.WA_DeleteOnClose, False)

        self.image_mode = False
        self.current_pixmap = None
        self.raw_text = ''

        layout = QVBoxLayout(self)

        self.status = QLabel('Ready. Paste a screenshot or upload an image.')
        self.status.setStyleSheet('color: #aaa; font-style: italic;')
        layout.addWidget(self.status)

        btn_row = QHBoxLayout()
        self.paste_btn = QPushButton('Read Clipboard (Ctrl+V)')
        self.paste_btn.clicked.connect(self.read_clipboard)
        self.upload_btn = QPushButton('Upload Image')
        self.upload_btn.clicked.connect(self.upload_image)
        self.copy_btn = QPushButton('Copy All')
        self.copy_btn.clicked.connect(self.copy_result)
        self.toggle_btn = QPushButton('Switch to Image View')
        self.toggle_btn.clicked.connect(self.toggle_mode)
        self.toggle_btn.setVisible(False)

        for btn in [self.paste_btn, self.upload_btn, self.copy_btn, self.toggle_btn]:
            btn.setStyleSheet('''
                QPushButton { padding: 8px 16px; background: #16213e; color: #fff;
                    border: 1px solid #0f3460; border-radius: 6px; }
                QPushButton:hover { background: #0f3460; }
                QPushButton:disabled { background: #333; color: #666; }
            ''')
            btn_row.addWidget(btn)
        layout.addLayout(btn_row)

        self.result = QTextEdit()
        self.result.setPlaceholderText('OCR result will appear here...')
        self.result.setStyleSheet('''
            QTextEdit { background: #0d1b2a; color: #e0e0e0; border: 1px solid #0f3460;
                border-radius: 6px; padding: 12px; font-family: monospace; font-size: 14px; }
        ''')
        layout.addWidget(self.result, 1)

        self.image_label = OCRLabel()
        self.image_label.setAlignment(Qt.AlignCenter)
        self.image_label.setStyleSheet('background: #0d1b2a; border: 1px solid #0f3460; border-radius: 6px;')
        self.image_label.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
        self.image_label.setVisible(False)
        self.image_label.selectionChanged.connect(self.on_selection_changed)
        layout.addWidget(self.image_label, 1)

        sel_row = QHBoxLayout()
        self.word_display = QLabel('')
        self.word_display.setStyleSheet('color: #e94560; padding: 4px;')
        self.word_display.setWordWrap(True)
        self.word_display.setVisible(False)
        sel_row.addWidget(self.word_display, 1)

        self.copy_sel_btn = QPushButton('Copy Selected')
        self.copy_sel_btn.setStyleSheet('''
            QPushButton { padding: 6px 14px; background: #16213e; color: #fff;
                border: 1px solid #0f3460; border-radius: 6px; }
            QPushButton:hover { background: #0f3460; }
            QPushButton:disabled { background: #333; color: #666; }
        ''')
        self.copy_sel_btn.clicked.connect(self.copy_selected)
        self.copy_sel_btn.setVisible(False)
        sel_row.addWidget(self.copy_sel_btn)
        layout.addLayout(sel_row)

        self.setStyleSheet('''
            QWidget { background: #1a1a2e; color: #e0e0e0; }
        ''')

        QShortcut(QKeySequence("Ctrl+V"), self, self.read_clipboard)

        self.ocr_boxes = []
        self.selected_boxes = []
        self.img_w = 0
        self.img_h = 0
        self._worker = None

    def read_clipboard(self):
        img = ImageGrab.grabclipboard()
        if img is None:
            self.status.setText('Clipboard has no image.')
            return
        self.status.setText('Reading clipboard...')
        self.paste_btn.setEnabled(False)
        self.upload_btn.setEnabled(False)
        self._worker = OCRWorker(image_data=img)
        self._worker.finished.connect(self.on_ocr_done)
        self._worker.start()

    def upload_image(self):
        path, _ = QFileDialog.getOpenFileName(self, 'Select Image', '', 'Images (*.png *.jpg *.jpeg *.bmp *.tiff)')
        if not path:
            return
        self.status.setText(f'Processing {os.path.basename(path)}...')
        self.paste_btn.setEnabled(False)
        self.upload_btn.setEnabled(False)
        self._worker = OCRWorker(image_path=path)
        self._worker.finished.connect(self.on_ocr_done)
        self._worker.start()

    def copy_result(self):
        QApplication.clipboard().setText(self.result.toPlainText())
        self.status.setText('Copied to clipboard!')

    def copy_selected(self):
        words = [b[0] for b in self.selected_boxes]
        QApplication.clipboard().setText(' '.join(words))
        self.status.setText(f'Copied {len(words)} selected word(s) to clipboard!')

    def toggle_mode(self):
        self.image_mode = not self.image_mode
        self.result.setVisible(not self.image_mode)
        self.image_label.setVisible(self.image_mode)
        self.word_display.setVisible(self.image_mode)
        self.copy_sel_btn.setVisible(self.image_mode)
        self.toggle_btn.setText('Switch to Text View' if self.image_mode else 'Switch to Image View')
        if self.image_mode and self.current_pixmap:
            self.image_label.setPixmap(self.current_pixmap)
            self.image_label.setBoxes(self.ocr_boxes, self.img_w, self.img_h)
            self.image_label.update()

    def on_selection_changed(self, boxes, ctrl):
        if ctrl:
            for box in boxes:
                bw, bx, by = box[0], box[1], box[2]
                found = False
                for i, (w, x, y, _, _) in enumerate(self.selected_boxes):
                    if w == bw and x == bx and y == by:
                        self.selected_boxes.pop(i)
                        found = True
                        break
                if not found:
                    self.selected_boxes.append(box)
        else:
            self.selected_boxes = list(boxes)

        indices = []
        for sel in self.selected_boxes:
            bw, bx, by = sel[0], sel[1], sel[2]
            for i, box in enumerate(self.ocr_boxes):
                if box[0] == bw and box[1] == bx and box[2] == by:
                    indices.append(i)
                    break
        self.image_label.set_selected_indices(indices)

        words = [b[0] for b in self.selected_boxes]
        self.word_display.setText('Selected: ' + ' '.join(words))

    def on_ocr_done(self, text, error, boxes):
        self.paste_btn.setEnabled(True)
        self.upload_btn.setEnabled(True)
        self._worker = None
        if error:
            self.result.setText(f'Error: {error}')
            self.status.setText('OCR failed.')
            return

        self.raw_text = text
        self.ocr_boxes = boxes
        self.selected_boxes = []
        self.image_label.set_selected_indices([])
        self.word_display.setText('')
        self.result.setText(text)
        self.status.setText(f'OCR complete. {len(text)} characters.')

        if boxes:
            img = ImageGrab.grabclipboard()
            if img is not None:
                self.img_w, self.img_h = img.size
                qim = ImageQt.ImageQt(img)
                self.current_pixmap = QPixmap.fromImage(qim)
                self.toggle_btn.setVisible(True)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setApplicationName('UToolkit OCR Plugin')
    app.setStyle('Fusion')
    dark_palette = app.palette()
    dark_palette.setColor(app.palette().Window, QColor('#1a1a2e'))
    dark_palette.setColor(app.palette().WindowText, QColor('#e0e0e0'))
    app.setPalette(dark_palette)
    win = OCRWindow()
    win.show()
    sys.exit(app.exec())
