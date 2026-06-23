# Custom OCR Engines

By default, Ultimate Toolkit uses **Tesseract OCR**. You can add custom engines.

## PaddleOCR

Excellent for Chinese, Japanese, and Korean text.

```bash
pip install paddleocr
```

## TrOCR

Microsoft's Transformer-based OCR for highest accuracy.

Use via HuggingFace inference API or run locally with `pip install transformers torch`.