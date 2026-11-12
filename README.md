<div align="center">

# 🎬 Movie Recommendation Dashboard

**Visualisasi hasil rekomendasi FCM-hybrid pada MovieLens 100K — Top-N vs data test aktual, lengkap dengan skor evaluasi.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Dataset](https://img.shields.io/badge/Dataset-MovieLens_100K-orange)

<!-- Ganti dengan tangkapan layar aplikasi -->
<!-- ![Dashboard](docs/screenshot-dashboard.png) -->

</div>

---

## 📖 Tentang Proyek

Dashboard ini membantu **mengevaluasi sistem rekomendasi secara kualitatif**, bukan hanya lewat angka rata-rata. Untuk setiap *fold* dan *user*, aplikasi menampilkan:

| Panel | Isi |
|---|---|
| **System Recommendations** (kiri) | Top-10 / Top-20 film hasil model beserta prediksi rating |
| **Actual Test Data** (kanan) | Seluruh data test (*held-out*) user: rating aktual, prediksi, selisih, dan badge Top-10/Top-20 |
| **Kartu metrik** | NDCG, Precision, Recall, RMSE per user, dibandingkan dengan **NBCF** |
| **Model Overview & Compare** | MAE, MSE, RMSE, Precision, Recall, F1, DCG, NDCG @10/@20 per fold dan rata-rata 5 fold, **FCM vs NBCF** |

**Model utama:** Fuzzy C-Means (FCM) · `mode=argmax` · `variant=hybrid` · `cu=2` · `ci=2`
**Pembanding:** NBCF (tanpa FCM)
**Tujuan:** laporan (demo lokal dan tangkapan layar)

> 📄 Spesifikasi lengkap ada di [`PRD.md`](./PRD.md).

---

## ✨ Fitur

- 🔀 **Pemilih Fold (1–5)** dan **pemilih User** (dengan pencarian) — hanya user yang punya data test pada fold tersebut.
- 🎯 **Top-N toggle** (10 / 20) dengan metrik yang ikut berubah.
- ✅ **Match Highlight** — film rekomendasi yang muncul di data test (*Ground Truth Match*) disorot, lengkap dengan hitungan hit.
- 🏷️ Badge **Top-10 / Top-20** dan **Exact Match** pada data test.
- 🎭 **Filter genre** dan **sort** daftar.
- 📊 **Delta vs NBCF** pada setiap kartu metrik.
- 📈 Halaman **Compare** (tabel + bar chart) dengan tombol *copy* tabel untuk laporan.
- 🌙 Tema gelap, dioptimalkan untuk tangkapan layar 1440 × 900.
- 🔗 Seluruh state tersimpan di URL (`?fold=1&user=45&n=10`) sehingga mudah dibagikan.

---

## 🧱 Tech Stack

| Bagian | Teknologi |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Data fetching & state | TanStack Query, Zustand / URL params |
| UI | lucide-react, Headless UI / cmdk, Recharts, react-window |
| Pipeline data | Python 3.10+, pandas, pyarrow |
| Pengujian | Vitest, React Testing Library, pytest |

---

## 🗂️ Struktur Proyek

```
movielens-recsys-ui/
├─ public/
│  └─ data/                    # hasil export (dibuat oleh skrip Python)
│     ├─ items.json
│     ├─ eval.json
│     └─ folds/F1.json … F5.json
├─ scripts/
│  ├─ export_json.py           # parquet → JSON + metrik per user
│  └─ reconcile.py             # cek rata-rata per user == file eval
├─ src/
│  ├─ api/  hooks/  lib/  types/
│  ├─ components/              # layout, summary, toolbar, recommendations,
│  │                           # testdata, overview, compare, ui
│  └─ pages/                   # Dashboard.tsx, Compare.tsx
├─ tests/
├─ PRD.md
└─ README.md
```

---

## 📦 Data yang Dibutuhkan

> ⚠️ Data **tidak disertakan** di repositori ini (lihat [Lisensi](#-lisensi--sitasi)). Siapkan sendiri di komputer Anda.

### 1. Dataset MovieLens 100K — `ml-100k/`

| File | Kegunaan |
|---|---|
| `u1.base … u5.base` | Data train per fold |
| `u1.test … u5.test` | Data test per fold |
| `u.item` | Judul, tahun, genre, link IMDb |
| `u.user` | Usia, gender, pekerjaan (opsional) |

Unduh dari <https://grouplens.org/datasets/movielens/100k/>.

### 2. Hasil model — `hasil_akhir/ml-100k/`

| Isi | Contoh file | Kolom |
|---|---|---|
| Top-100 rekomendasi | `argmax/topn/F1_fcm_cu2_ci2.parquet` | `user_id, rank, item_id, predicted_rating` |
| Prediksi rating pasangan test | `argmax/pred/F1_fcm_cu2_ci2.parquet` | `user_id, item_id, predicted_rating` |
| Evaluasi global | `eval/argmax_F1.parquet` | `mode, fold, method, cu, ci, grid_u, grid_i, task, variant, metric, N, value, n_eval` |
| Hasil NBCF | *(lokasi sesuai proyek Anda)* | sama seperti di atas |

Fold 1–5 memakai pola nama yang sama (`F1` … `F5`).

> Path di atas hanya contoh. Sesuaikan lewat argumen skrip (lihat bagian berikut).

---

## 🚀 Menjalankan Proyek

### Prasyarat
- Node.js ≥ 18
- Python ≥ 3.10

### 1. Instal dependensi

```bash
# Frontend
npm install

# Pipeline data
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install pandas pyarrow
```

### 2. Konversi parquet → JSON

```bash
python scripts/export_json.py \
  --dataset  ml-100k \
  --results  hasil_akhir/ml-100k \
  --out      public/data
```

Skrip ini akan:
1. Membaca train/test, Top-100, prediksi rating, dan file eval (FCM & NBCF).
2. Menghitung metrik per user (@10 dan @20), RMSE/MAE per user, dan afinitas genre.
3. Menjalankan **rekonsiliasi** — export dihentikan jika rata-rata per user tidak sama dengan file eval.
4. Menulis `items.json`, `eval.json`, dan `folds/F1…F5.json` ke `public/data`.

Jalankan cek rekonsiliasi secara terpisah kapan saja:

```bash
python scripts/reconcile.py --dataset ml-100k --results hasil_akhir/ml-100k
```

### 3. Jalankan aplikasi

```bash
npm run dev          # mode pengembangan  → http://localhost:5173
npm run build        # build produksi
npm run preview      # pratinjau hasil build
npm run test         # unit & component test
```

---

## 📐 Definisi Metrik

Seluruh metrik per user dihitung dengan definisi yang **sama** dengan file eval, sehingga rata-ratanya dapat dicocokkan.

| Metrik | Definisi |
|---|---|
| **Relevan** | Semua item di data test user (rating ≥ 1) |
| **Hit** | Item Top-N yang ada di data test user |
| **Precision@N** | `hits / N` |
| **Recall@N** | `hits / jumlah item test user` |
| **F1@N** | `2·P·R / (P + R)` |
| **DCG@N** | `Σ rel_i / log2(i+1)`, `rel_i ∈ {0,1}` |
| **NDCG@N** | `DCG@N / IDCG@N`, dengan `IDCG@N` = DCG bila **seluruh N posisi relevan** (N=10 → 4,5434; N=20 → 7,0386) |
| **MAE / MSE / RMSE** | Dihitung atas pasangan test × prediksi; nilai global bersifat *pooled* (bukan rata-rata RMSE per user) |

> ℹ️ **Catatan NDCG:** normalisasi memakai DCG ideal untuk N item yang semuanya relevan, bukan berdasarkan jumlah item relevan milik masing-masing user. Ini mengikuti hasil pada file eval dan menjelaskan mengapa nilainya relatif kecil.

---

## 🖥️ Cara Membaca Tampilan

| Elemen | Arti |
|---|---|
| **Ground Truth Match** (kiri) | Film rekomendasi yang juga ada di data test user |
| Baris tanpa badge (kiri) | Film rekomendasi yang tidak ada di data test |
| **Top-10 / Top-20** (kanan) | Film test yang masuk Top-10 / Top-20 rekomendasi model |
| **Exact Match** | Prediksi sama persis dengan rating aktual |
| **Δ ±x vs Pred (y)** | `rating aktual − prediksi` |
| **0 Hits** | Tidak ada rekomendasi yang muncul di data test user — kondisi yang wajar |

> **Hit tidak sama dengan "disukai".** Karena seluruh rating test dianggap relevan, sebuah hit bisa saja memiliki rating aktual rendah. Rating aktual selalu ditampilkan untuk menunjukkan hal ini.

---

## 🧪 Pengujian

| Level | Cakupan |
|---|---|
| Pipeline (`pytest`) | Rekonsiliasi dengan file eval, validasi tidak ada item train di Top-N, `rank` berurutan, semua `item_id` ada di `u.item` |
| Unit (`vitest`) | Sort/filter/join, rata-rata Observed & Predicted, format tanggal |
| Komponen (RTL) | Badge hit / Top-10 / Top-20 / Exact Match, toggle N, state 0-hit, fallback delta NBCF |

---

## 🗺️ Roadmap

- [x] PRD & kontrak data (`PRD.md`)
- [ ] Pipeline: `export_json.py` + `reconcile.py`
- [ ] Dashboard: header, ringkasan user, kartu metrik, dua panel
- [ ] Toolbar: genre, sort, N, match highlight, state di URL
- [ ] Model Overview & Compare (FCM vs NBCF)
- [ ] Polish tampilan untuk laporan, a11y, test
- [ ] *(Opsional)* Toggle model FCM / NBCF untuk melihat rekomendasi NBCF per user

---

## 🛠️ Pemecahan Masalah

| Gejala | Kemungkinan penyebab |
|---|---|
| Rekonsiliasi gagal | Path/fold salah, atau definisi hit/F1 berbeda dari yang dipakai saat evaluasi |
| Dropdown user hanya berisi ±459 user pada fold 1 | Wajar — hanya user yang punya data test pada fold tersebut |
| Skor eval tidak ditemukan | Filter eval harus `mode=argmax, method=fcm, cu=2, ci=2, variant=hybrid` |
| Daftar test sangat panjang | Normal (rata-rata ±44 item/user); panel kanan memakai scroll internal |
| Layar kosong setelah `npm run dev` | `public/data` belum dibuat — jalankan `export_json.py` terlebih dulu |

---

## 📜 Lisensi & Sitasi

Kode aplikasi ini dapat Anda beri lisensi sesuai kebutuhan (mis. MIT). **Dataset MovieLens memiliki ketentuan sendiri:**

- Tidak boleh menyiratkan *endorsement* dari University of Minnesota / GroupLens.
- Wajib mencantumkan penggunaan dataset pada publikasi/laporan.
- **Dilarang** mendistribusikan ulang data tanpa izin — jangan mengunggah `u*.base`, `u*.test`, atau `u.data` ke repositori publik.
- **Dilarang** penggunaan komersial tanpa izin.

**Sitasi:**

> F. Maxwell Harper and Joseph A. Konstan. 2015. *The MovieLens Datasets: History and Context.* ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4, Article 19. DOI: [10.1145/2827872](https://doi.org/10.1145/2827872)

---

<div align="center">

Dibuat untuk keperluan laporan · Dataset © GroupLens Research, University of Minnesota

</div>
