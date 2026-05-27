# Sorusal — SAT Math Soru Bankası

Türkçe arayüzlü, SAT Matematik soru bankası. GitHub Pages üzerinde barındırılan statik bir web uygulamasıdır.

🔗 **Canlı site:** `https://<kullanıcı-adı>.github.io/sorusal_claude/`

---

## Özellikler

- **4 ana alan** ve **18 alt konu** (Digital SAT yapısına uygun)
- **Metin, görsel ve LaTeX** matematik içerikli sorular (KaTeX)
- **Zorluk filtresi** — Kolay / Orta / Zor / Hepsi
- **Soru sayısı seçimi** — 5 / 10 / 20 / Tümü
- **Sonuç sayfası** — animasyonlu skor halkası + soru incelemesi + açıklamalar
- **Aynı soruları tekrar çöz** özelliği
- **Mobil uyumlu** — responsive tasarım
- **Hesap gerekmez** — anonim kullanım

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | Vanilla HTML5 / CSS3 / ES Modules |
| Matematik | [KaTeX](https://katex.org/) (CDN) |
| Yazı tipi | Google Fonts — Inter |
| Barındırma | GitHub Pages (ücretsiz) |
| Veri | JSON dosyaları |

---

## Proje Yapısı

```
sorusal_claude/
├── index.html          # Ana sayfa (bölüm ve ayar seçimi)
├── quiz.html           # Sınav sayfası
├── results.html        # Sonuç ve inceleme sayfası
├── css/
│   ├── main.css        # CSS değişkenleri, reset, tipografi
│   ├── components.css  # Kartlar, chip, butonlar, seçimler
│   ├── index.css       # Ana sayfa stilleri
│   ├── quiz.css        # Sınav sayfası stilleri
│   └── results.css     # Sonuç sayfası stilleri
├── js/
│   ├── data.js         # JSON yükleme ve örnekleme
│   ├── state.js        # sessionStorage sınav durumu
│   ├── katex-render.js # KaTeX render yardımcıları
│   ├── index.js        # Ana sayfa kontrolcüsü
│   ├── quiz.js         # Sınav kontrolcüsü
│   └── results.js      # Sonuç kontrolcüsü
├── data/
│   ├── sections.json   # Bölüm/alt konu manifesti
│   ├── algebra/        # Cebir soruları (4 dosya)
│   ├── advanced-math/  # İleri matematik soruları (4 dosya)
│   ├── problem-solving/# Problem çözme soruları (5 dosya)
│   └── geometry/       # Geometri soruları (5 dosya)
└── images/
    └── questions/      # Soru görselleri (PNG/SVG)
```

---

## Soru JSON Şeması

Her alt konu dosyası bir soru dizisi içerir. `type` alanı `"text"`, `"latex"` veya `"image"` olabilir.

```json
{
  "id": "ALG-LE-001",
  "section": "algebra",
  "subsection": "linear-equations",
  "difficulty": "easy",
  "question": { "type": "text", "content": "If 3x − 7 = 14, what is x?" },
  "choices": [
    { "label": "A", "type": "text", "content": "5" },
    { "label": "B", "type": "text", "content": "7" },
    { "label": "C", "type": "text", "content": "9" },
    { "label": "D", "type": "text", "content": "21" }
  ],
  "correctIndex": 1,
  "explanation": { "type": "text", "content": "3x = 21, x = 7." }
}
```

**LaTeX içerik:** Satır içi için `$...$`, görüntüleme için `$$...$$` kullanın.

---

## Yeni Soru Ekleme

İlgili alt konu JSON dosyasını açın (ör. `data/algebra/linear-equations.json`) ve diziye yeni bir nesne ekleyin.

---

## GitHub Pages'e Deploy

```bash
git init
git add .
git commit -m "Initial commit: Sorusal SAT Math"
gh repo create sorusal_claude --public --source=. --remote=origin --push
```

Ardından GitHub → **Settings → Pages → Branch: main / (root) → Save**.

---

## Yerel Geliştirme

```bash
python -m http.server 8080
# → http://localhost:8080 adresini açın
```

ES Modules, `file://` protokolü üzerinde çalışmaz. Mutlaka bir HTTP sunucusu kullanın.

---

## Katkı

Yeni soru eklemek için ilgili JSON dosyasını düzenleyip pull request açabilirsiniz.

---

*SAT® College Board'ın tescilli markasıdır. Bu proje College Board ile bağlantılı değildir.*
