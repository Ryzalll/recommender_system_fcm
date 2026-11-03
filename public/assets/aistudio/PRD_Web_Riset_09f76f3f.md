# PRD — Movie Recommendation System Dashboard (MovieLens 100K)

| | |
|---|---|
| **Versi** | 0.3 (draft) |
| **Tanggal** | 20 Oktober 2026 |
| **Stack** | React 18 + TypeScript + Vite + Tailwind CSS |
| **Dataset** | MovieLens 100K (GroupLens, Univ. of Minnesota) |
| **Model utama** | FCM — `mode=argmax`, `variant=hybrid`, `cu=2`, `ci=2` (satu konfigurasi saja) |
| **Model pembanding** | NBCF (tanpa FCM) |
| **Tujuan akhir** | Laporan (demo lokal + tangkapan layar) |
| **Referensi desain** | Screenshot UI dark-theme "Movie Recommendation System" |

### Perubahan dari v0.2
- **Satu konfigurasi saja** (`argmax · fcm · cu2 · ci2 · hybrid`) → pemilih konfigurasi dihapus; yang tersisa **pemilih Fold (1–5)** dan **pemilih User**.
- **Relevan = rating ≥ 1** → semua item test dianggap relevan; hit = item Top-N yang ada di data test user.
- **File prediksi rating** tersedia → Δ vs Pred dan RMSE/MAE per user tersedia untuk **semua** item test.
- **Ranking Top-100 tersedia, tetapi UI hanya memakai badge "Top-10" dan "Top-20"**.
- Badge **"Latent Discovery"/"Unverified" dihapus**.
- **Tie** diurutkan menurut `item_id` (sudah demikian di parquet) → tidak ada logika tambahan.
- Membership klaster FCM **tidak ditampilkan** (di luar cakupan).
- Baseline pembanding diganti **NBCF** (bukan VAE-CF).
- Tujuan **laporan** → hosting publik tidak diperlukan; fokus pada tampilan siap-tangkap-layar dan tabel ringkasan.

---

## 1. Ringkasan & Tujuan

Dashboard untuk **mengevaluasi hasil rekomendasi FCM-hybrid** secara visual. Untuk setiap fold dan user, halaman menampilkan:

1. **Top-N rekomendasi** (N = 10 atau 20) dengan prediksi rating.
2. **Data test aktual** (held-out) milik user yang sama, lengkap dengan rating aktual, prediksi, dan selisihnya.
3. **Perbandingan side-by-side**: film yang *hit*, posisi Top-10/Top-20, dan keterangan *Exact Match*.
4. **Skor evaluasi per user** (NDCG, Precision, Recall, RMSE) dibandingkan dengan **NBCF**.
5. **Ringkasan global** (MAE, MSE, RMSE, Precision, Recall, F1, DCG, NDCG @10/@20) per fold dan rata-rata 5 fold, untuk **FCM vs NBCF**.

**Non-goals:** training dari browser, login, rekomendasi real-time user baru, tampilan keanggotaan klaster FCM, hosting publik/komersial.

---

## 2. Sumber Data

Akar dataset: `ml-100k/`. Akar hasil: `hasil_akhir/ml-100k/` (dibuat sebagai konfigurasi path di skrip; lihat Q1).

| Sumber | Lokasi (perkiraan, dapat dikonfigurasi) | Skema | Kegunaan |
|---|---|---|---|
| **Top-N (Top-100)** | `{HASIL}/argmax/topn/F{fold}_fcm_cu2_ci2.parquet` | `user_id, rank, item_id, predicted_rating` | Panel kiri; ranking item test |
| **Prediksi rating** | `{HASIL}/argmax/pred/F{fold}_fcm_cu2_ci2.parquet` (F1–F5) | diasumsikan `user_id, item_id, predicted_rating` | Δ vs Pred, RMSE/MAE per user |
| **Eval FCM** | `{HASIL}/eval/argmax_F{fold}.parquet` | long: `mode, fold, method, cu, ci, grid_u, grid_i, task, variant, metric, N, value, n_eval` | Skor global |
| **NBCF** | ❓ (lokasi & skema belum diketahui; Q2) | diharapkan sama: topn, pred, eval | Pembanding |
| **Train** | `ml-100k/u{fold}.base` | `user_id \| item_id \| rating \| timestamp` | Jumlah train, afinitas genre |
| **Test** | `ml-100k/u{fold}.test` | idem | Panel kanan, hit, metrik |
| **Item** | `ml-100k/u.item` | `movie_id \| title \| release_date \| … \| IMDb_URL \| 19 genre` | Judul, tahun, genre, IMDb |
| **User** | `ml-100k/u.user` | `user_id \| age \| gender \| occupation \| zip` | Profil opsional |

> ⚠️ **Konfirmasi nama file.** Pada diskusi awal file Top-N disebut `F1_fcm_cu2_ci11.parquet`, sedangkan konfigurasi final adalah `cu2_ci2`. Pipeline memakai **`cu2_ci2`** untuk Top-N dan pred. Filter eval: `mode=argmax, method=fcm, cu=2, ci=2, variant=hybrid`.

---

## 3. Temuan dari Data

### 3.1 Rumus NDCG pada eval tidak standar
Rasio `dcg / ndcg` pada fold 1 adalah 4,543 (N=10) dan 7,04 (N=20), yaitu DCG ideal jika **seluruh N posisi relevan**:

```
DCG@N   = Σ_{i=1..N} rel_i / log2(i+1)     rel_i ∈ {0,1}
IDCG@N  = Σ_{i=1..N} 1   / log2(i+1)       (N=10 → 4.5434 ; N=20 → 7.0386)
NDCG@N  = DCG@N / IDCG@N
```

UI wajib memakai rumus ini agar rata-rata per user sama dengan file eval. Tooltip kartu NDCG menyebutkan definisi ini.

### 3.2 Relevansi = rating ≥ 1 (semua item test relevan)
- `relevant(u)` = seluruh item di `u{fold}.test` milik user u.
- `hit` = item Top-N yang ada di test user (berapa pun rating aktualnya).
- `Recall@N = hits / testCount(u)`.
- Konsistensi dengan eval fold 1: P@10 ≈ 0,10 (≈1 hit/user) dan test ≈ 44 item/user (20.000 / 459) → Recall ≈ 1/44 ≈ 0,023, sesuai nilai eval 0,0223. `n_eval` topn = **459 = jumlah user yang punya data test di fold 1** (bukan 943).
- **Catatan interpretasi:** *hit ≠ disukai*. Item bisa hit dengan rating aktual 1. Karena itu rating aktual selalu ditampilkan di samping badge.

### 3.3 Eval = rata-rata fold, bukan per user
- Skor per user dihitung pipeline; file eval dipakai untuk **pembanding & rekonsiliasi**.
- RMSE/MSE global dihitung **pooled** atas 20.000 pasangan (bukan rata-rata RMSE per user).

### 3.4 Performa nyata ≈ 1 hit/user
Sering terjadi **0 hit**; UI harus ramah untuk 0–2 hit (§9).

### 3.5 Prediksi integer & tie
`predicted_rating` integer (mis. banyak "5"); tie diurutkan `item_id` (sudah di parquet). Rata-rata prediksi Top-N akan sering mendekati 5,0; kartu tetap ditampilkan sesuai mockup.

### 3.6 Daftar test panjang
Rata-rata ≈ 44 item test/user (bisa >100 untuk user aktif). Panel kanan perlu scroll internal dan penyederhanaan render (virtualisasi atau "Load more").

---

## 4. Perbedaan Mockup vs Data Nyata

| # | Mockup | Data nyata | Tindakan |
|---|---|---|---|
| 1 | Film 2000-an, tanggal 2023 | ML-100K, log **1997–1998** | Data dari `u.item` & timestamp |
| 2 | Kolom **Score** | Tidak ada | Dihapus |
| 3 | Rating desimal | Integer | Bintang integer |
| 4 | Badge **Latent Discovery** | — | **Dihapus** (baris non-hit tanpa badge) |
| 5 | "Model Predicted: Rank 1…21" | Ada Top-100, tetapi hanya Top-10/20 dipakai | Badge **"Top-10"** / **"Top-20"**; di luar itu tanpa badge |
| 6 | "Exact Match (4.8)" | `actual == predicted` | **Exact Match** untuk semua item test (pred tersedia) |
| 7 | 12 item test | ≈ 20–100+ item | Scroll internal |
| 8 | NDCG 0,842 · P@10 0,700 | ≈ 0,1 | Angka dari pipeline |
| 9 | Kartu MAP | Tidak ada | Diganti **Recall@N** |
| 10 | "+0,038 vs VAE-CF" | — | **Δ vs NBCF** |
| 11 | Genre "Neo-Noir" dll. | 19 genre resmi | Genre resmi |

---

## 5. User Stories

| ID | User story |
|---|---|
| US-1 | Memilih **fold (1–5)** dan **user** yang punya data test di fold itu. |
| US-2 | Melihat Top-10/Top-20 rekomendasi dengan prediksi rating. |
| US-3 | Melihat seluruh data test user berdampingan, dengan rating aktual, prediksi, dan Δ. |
| US-4 | Melihat hit ter-highlight dan badge Top-10/Top-20 pada item test. |
| US-5 | Melihat NDCG, Precision, Recall, RMSE user dan selisihnya terhadap NBCF. |
| US-6 | Melihat ringkasan global per fold + rata-rata 5 fold untuk FCM. |
| US-7 | Membandingkan FCM vs NBCF dalam tabel & grafik (untuk laporan). |
| US-8 | Memfilter genre, mengurutkan daftar, dan mengganti N (10/20). |

---

## 6. Pipeline & Arsitektur

**Keputusan:** *pre-compute offline → JSON statis* (hanya 1 konfigurasi × 5 fold), dijalankan lokal.

```
parquet (topn, pred, eval; FCM & NBCF) + u{fold}.base/.test + u.item/u.user
        │
        ▼  scripts/export_json.py  (pandas + pyarrow)
public/data/
  ├─ items.json              # movieId → title, year, genres, imdbUrl
  ├─ eval.json               # {fcm:{1..5,avg}, nbcf:{1..5,avg}}
  └─ folds/F1.json … F5.json # seluruh user pada fold (1 file/fold)
        │
        ▼
React app (Vite) — jalan lokal (`npm run dev` / `vite preview`)
```

Alasan 1 file per fold: hanya ~459–943 user/fold (±2–4 MB mentah, jauh lebih kecil bila gzip), sehingga pergantian user instan tanpa fetch ulang. Jika terlalu besar, dipecah per user.

### 6.1 Langkah `export_json.py`
1. Baca `u{fold}.base`, `u{fold}.test`, `u.item`, `u.user`.
2. Baca Top-100 dan pred (FCM); ambil 20 teratas per user untuk daftar; simpan **ranking** (≤100) untuk item test.
3. Hitung `relevant = seluruh item test user`; hitung metrik @10 dan @20 (§6.2).
4. Hitung RMSE/MAE per user dari pasangan test × pred.
5. Hitung afinitas genre dari data **train** (persentase film train user yang mengandung genre tersebut; 3 teratas).
6. Lakukan hal yang sama untuk NBCF bila tersedia (→ `baseline`).
7. Pivot file eval → `eval.json`; `avg` = **rata-rata sederhana 5 fold**.
8. Jalankan rekonsiliasi (§6.3); gagal → hentikan export.

### 6.2 Metrik per user (sesuai eval)

```python
import numpy as np

def dcg(rels):
    return sum(r / np.log2(i + 2) for i, r in enumerate(rels))

IDCG = {n: dcg([1] * n) for n in (10, 20)}          # 4.5434, 7.0386

def topn_metrics(top_items, test_items, n):          # test_items: set item_id user
    rel  = [1 if i in test_items else 0 for i in top_items[:n]]
    hits = sum(rel)
    p, r = hits / n, hits / len(test_items)
    f1   = 2 * p * r / (p + r) if (p + r) else 0.0
    d    = dcg(rel)
    return dict(hits=hits, precision=p, recall=r, f1=f1, dcg=d, ndcg=d / IDCG[n])

def rating_metrics(pred, actual):                    # array per user
    err = np.asarray(pred) - np.asarray(actual)
    return dict(rmse=float(np.sqrt(np.mean(err**2))), mae=float(np.mean(np.abs(err))))
```

### 6.3 Rekonsiliasi (wajib lulus)

| Cek | Target |
|---|---|
| Jumlah user dengan data test | = `n_eval` topn (fold 1: 459) |
| Rata-rata per user: precision, recall, f1, dcg, ndcg @10 & @20 | = baris eval (toleransi 1e-6) |
| Jumlah pasangan pred = jumlah baris `u{fold}.test` | = `n_eval` rating (20.000) |
| MSE pooled (Σ error² / jumlah pasangan), RMSE = √MSE, MAE | = baris eval rating |
| `predicted_rating` di Top-N = `predicted_rating` pada pred untuk pasangan yang sama | konsisten |

Jika ada yang tidak cocok → periksa definisi hit/f1 (rata-rata per user vs dari rata-rata) dan path/fold.

### 6.4 Validasi data
- Tidak ada item Top-N yang ada di `u{fold}.base` user yang sama.
- `rank` per user 1..100 berurutan tanpa duplikat.
- Seluruh `item_id` ada di `u.item`.

---

## 7. Kontrak Data (JSON)

`eval.json`
```json
{
  "fcm": {
    "1": {
      "rating": { "mae": 0.86695, "mse": 1.59945, "rmse": 1.26469, "nEval": 20000 },
      "topn": {
        "10": { "precision": 0.1, "recall": 0.0223, "f1": 0.0321, "dcg": 0.4848, "ndcg": 0.1067, "nEval": 459 },
        "20": { "precision": 0.0962, "recall": 0.0430, "f1": 0.0506, "dcg": 0.7163, "ndcg": 0.1017, "nEval": 459 }
      }
    },
    "avg": { "rating": {}, "topn": {} }
  },
  "nbcf": { "1": {}, "avg": {} }
}
```

`folds/F1.json`
```json
{
  "fold": 1,
  "users": [
    {
      "id": 1,
      "profile": { "age": 24, "gender": "M", "occupation": "technician" },
      "trainCount": 56,
      "testCount": 44,
      "affinity": [ { "genre": "Drama", "pct": 41 }, { "genre": "Comedy", "pct": 30 }, { "genre": "Action", "pct": 22 } ],
      "recommendations": [
        { "rank": 1, "movieId": 10, "predictedRating": 5, "hit": true, "actualRating": 4 },
        { "rank": 2, "movieId": 12, "predictedRating": 5, "hit": false, "actualRating": null }
      ],
      "testItems": [
        { "movieId": 10, "actualRating": 4, "predictedRating": 5, "modelRank": 1, "timestamp": 875072484 }
      ],
      "metrics": {
        "10": { "hits": 1, "precision": 0.1, "recall": 0.023, "f1": 0.037, "dcg": 1.0, "ndcg": 0.22 },
        "20": { "hits": 2, "precision": 0.1, "recall": 0.045, "f1": 0.062, "dcg": 1.3, "ndcg": 0.18 },
        "rating": { "rmse": 1.2, "mae": 0.9 }
      },
      "baseline": {
        "name": "NBCF",
        "10": { "precision": 0.2, "recall": 0.045, "ndcg": 0.31 },
        "20": { "precision": 0.15, "recall": 0.068, "ndcg": 0.27 },
        "rating": { "rmse": 1.1, "mae": 0.85 }
      }
    }
  ]
}
```

Catatan:
- `baseline` bernilai `null` bila data NBCF per user tidak tersedia → kartu memakai pembanding **rata-rata fold NBCF** dari `eval.json`.
- `modelRank` = peringkat di Top-100 (`null` bila di luar); UI hanya memakai `≤10` dan `≤20`.
- Nilai contoh hanya ilustrasi.
- Judul/genre/tahun digabung di klien dari `items.json`.

---

## 8. Definisi Tampilan Data

### 8.1 Badge & label

| Lokasi | Label | Aturan |
|---|---|---|
| Kiri | **Ground Truth Match** (biru) | `hit = true` (item ada di test) |
| Kiri | *(tanpa badge)* | bukan hit |
| Kanan | **Top-10** (biru) | `modelRank ≤ 10` |
| Kanan | **Top-20** (biru muda) | `10 < modelRank ≤ 20` |
| Kanan | *(tanpa badge rank)* | `modelRank > 20` atau `null` |
| Kanan | **Exact Match** (oranye) | `actual == predicted` |
| Kanan | **Δ ±x vs Pred (y)** | `actual − predicted` (integer) |

### 8.2 Ringkasan header panel
- **Mean Pred. Rating** (kiri) = rata-rata `predictedRating` Top-N.
- **Observed Avg** (kanan) = rata-rata `actualRating` semua item test.

### 8.3 Kartu metrik (4)

| Kartu | Isi | Pembanding |
|---|---|---|
| NDCG@N | nilai user | Δ vs NBCF |
| Precision@N | nilai user + "hits/N in Test Set" | Δ vs NBCF |
| Recall@N | nilai user | Δ vs NBCF |
| RMSE | nilai user | Δ vs NBCF; MAE sebagai teks kecil |

Delta hijau bila FCM lebih baik (untuk RMSE: lebih kecil = lebih baik), merah bila lebih buruk. Metrik **tidak berubah** oleh filter genre/sort; hanya oleh **N** dan **fold**.

---

## 9. Kebutuhan Fungsional UI

| ID | Komponen | Kebutuhan |
|---|---|---|
| F-1 | Header | Judul; **Fold selector (1–5)**; **User selector** dengan pencarian (hanya user yang punya test di fold); (opsional v1.1) toggle **Model: FCM / NBCF**. URL: `?fold=1&user=45&n=10`. |
| F-2 | User Summary | `User_ID_{id}`, badge Test Split & Train Split, **Top Affinity Clusters** (maks. 3 genre dari data train, persentase film), usia/gender/pekerjaan. |
| F-3 | Metric Cards | Empat kartu §8.3 + tooltip rumus. |
| F-4 | Toolbar | Genre filter (dinamis), **Sort**, **N toggle 10/20**, **Match Highlight** (N Hits). |
| F-5 | Panel kiri | Rank, judul, badge, genre (maks. 3), prediksi ★ integer. Baris hit beraksen biru. |
| F-6 | Panel kanan | `#T-nn`, judul, badge Top-10/Top-20, genre, tanggal log, rating aktual ★, Exact Match / Δ vs Pred. Header sticky, scroll internal; render bertahap/virtualisasi untuk >100 item. |
| F-7 | Interaksi | Hover/fokus menyorot pasangan di panel seberang; klik judul membuka detail (tahun, genre, IMDb). |
| F-8 | **Model Overview** | Metrik global FCM dari eval: MAE, MSE, RMSE, `n_eval`; P/R/F1/DCG/NDCG @10 & @20; per fold terpilih + rata-rata 5 fold. |
| F-9 | **Compare (FCM vs NBCF)** | Tabel + bar chart semua metrik, per fold dan rata-rata; pemenang tiap metrik ditandai. Tombol "Copy as CSV/Markdown" (untuk laporan). |

**Sort:** opsi *Default*, *Predicted Rating*, *Actual Rating* (hanya panel kanan), *Release Year*, *Title*. Default kiri: `rank`; default kanan: `modelRank` naik (hit dulu), lalu item lain berdasarkan `item_id`.

### State khusus

| State | Perilaku |
|---|---|
| Loading | Skeleton |
| Error | Pesan + "Coba lagi" |
| **0 hit** | Badge "0 Hits"; pesan "Tidak ada rekomendasi yang muncul di data test user ini"; kedua panel tetap tampil |
| Hit dengan rating aktual rendah (1–2) | Rating tampil jelas agar *hit ≠ disukai* terlihat |
| Filter genre kosong | "Tidak ada film untuk genre ini" + reset |
| `baseline = null` | Delta memakai rata-rata fold NBCF, label "vs NBCF (fold avg)" |

---

## 10. Arsitektur Frontend

**Stack:** Vite · React 18 · TypeScript · Tailwind · TanStack Query · Zustand atau `useReducer` + URL params · lucide-react · Headless UI/cmdk · Recharts · react-window (daftar panjang) · Vitest + RTL.

```
movielens-recsys-ui/
├─ public/data/                 # items.json, eval.json, folds/F1..F5.json
├─ scripts/
│  ├─ export_json.py
│  └─ reconcile.py
├─ src/
│  ├─ main.tsx · App.tsx · config.ts
│  ├─ types/index.ts
│  ├─ api/data.ts               # fetchItems, fetchEval, fetchFold
│  ├─ hooks/                    # useFold, useEval, useViewState (↔ URL)
│  ├─ lib/                      # format.ts, sort.ts, join.ts, metrics.ts (verifikasi)
│  ├─ components/
│  │  ├─ layout/       Header, FoldSelect, UserSelect
│  │  ├─ summary/      UserSummaryCard, AffinityBadges, MetricCard
│  │  ├─ toolbar/      GenreFilter, SortSelect, NToggle, MatchHighlightToggle
│  │  ├─ recommendations/ RecommendationPanel, RecommendationRow
│  │  ├─ testdata/     TestDataPanel, TestItemRow
│  │  ├─ overview/     ModelOverview, EvalTable
│  │  ├─ compare/      CompareModels, MetricBarChart, CopyTableButton
│  │  └─ ui/           Badge, RatingStars, Skeleton, Tooltip
│  └─ pages/           Dashboard.tsx, Compare.tsx
└─ tests/
```

Routing: `/` (Dashboard user) dan `/compare` (Overview + FCM vs NBCF).

Tipe inti:
```ts
export interface Recommendation {
  rank: number; movieId: number; predictedRating: number;
  hit: boolean; actualRating: number | null;
}
export interface TestItem {
  movieId: number; actualRating: 1|2|3|4|5; predictedRating: number;
  modelRank: number | null; timestamp: number;
}
export interface TopNMetrics {
  hits: number; precision: number; recall: number; f1: number; dcg: number; ndcg: number;
}
export interface UserDetail {
  id: number;
  profile: { age?: number; gender?: string; occupation?: string };
  trainCount: number; testCount: number;
  affinity: { genre: string; pct: number }[];
  recommendations: Recommendation[];
  testItems: TestItem[];
  metrics: { "10": TopNMetrics; "20": TopNMetrics; rating: { rmse: number; mae: number } };
  baseline: null | {
    name: "NBCF";
    "10": Partial<TopNMetrics>; "20": Partial<TopNMetrics>;
    rating: { rmse: number; mae: number };
  };
}
```

---

## 11. Desain Visual

Mengikuti mockup (tema gelap). Warna di bawah **perkiraan** dari gambar; sesuaikan dengan file desain asli bila ada.

| Token | Perkiraan | Pemakaian |
|---|---|---|
| `bg-base` | `#0B1220` | Latar |
| `bg-card` | `#111A2B` | Kartu/panel |
| `border` | `#1E2A40` | Garis |
| `text-primary` | `#E6EDF7` | Judul film |
| `text-muted` | `#7F8CA3` | Meta |
| `accent-blue` | `#5BC0FF` | Hit, Top-10/20 |
| `accent-amber` | `#F5B83D` | Bintang, Exact Match |
| `positive` / `negative` | `#3DDC97` / `#FF6B6B` | Delta |

Font: sans (Inter) untuk judul, monospace untuk angka/badge. Layout utama 1440 px (dioptimalkan untuk tangkapan layar laporan); tablet 2×2 kartu; <768 px panel menumpuk/tab.

---

## 12. Non-Functional, Pengujian & Kriteria Penerimaan

| Aspek | Target |
|---|---|
| Performa | Load awal < 2 dtk; ganti user < 100 ms (data sudah di memori); ganti fold < 1 dtk |
| Aksesibilitas | Kontras WCAG AA; keyboard; status tidak hanya warna |
| Browser | Chrome/Edge/Firefox terbaru |
| Laporan | Tampilan bersih untuk tangkapan layar 1440×900; tabel Compare dapat disalin |

**Pengujian**
- *Pipeline*: rekonsiliasi §6.3 dan validasi §6.4 untuk F1–F5 (FCM & NBCF).
- *Unit*: sort/filter/join, rata-rata Observed/Predicted, format tanggal UTC, `metrics.ts` vs Python.
- *Komponen*: badge hit/non-hit; Top-10/Top-20/tanpa badge; Exact Match; toggle N; state 0-hit; `baseline=null`.

**Acceptance criteria v1**
- [ ] Rekonsiliasi lulus untuk 5 fold (FCM) dan NBCF.
- [ ] Memilih fold dan user menampilkan Top-N, data test lengkap, dan 4 kartu tanpa error.
- [ ] Jumlah *Ground Truth Match* di kiri = "N Hits" = jumlah item bertanda Top-10/Top-20 (≤N) di kanan.
- [ ] Mengganti N memperbarui daftar & metrik; filter/sort tidak mengubah metrik.
- [ ] Model Overview & Compare sama dengan file eval (FCM dan NBCF).
- [ ] User 0-hit dan user dengan >100 item test tampil benar & lancar.
- [ ] Footer memuat atribusi dataset.

---

## 13. Lisensi & Sitasi Dataset

Karena hasil digunakan untuk **laporan** (demo lokal/tangkapan layar):
- Cantumkan sitasi pada laporan dan footer aplikasi.
- Jangan mengunggah file mentah `u.data`, `u*.base`, `u*.test` ke repositori/situs publik tanpa izin GroupLens (redistribusi dilarang).
- Jangan menyiratkan endorsement Univ. of Minnesota/GroupLens; tidak untuk penggunaan komersial.

> Data: F. Maxwell Harper and Joseph A. Konstan. 2015. The MovieLens Datasets: History and Context. ACM Transactions on Interactive Intelligent Systems (TiiS) 5, 4, Article 19. DOI: 10.1145/2827872

---

## 14. Milestone (estimasi)

| Fase | Isi | Estimasi |
|---|---|---|
| M0 | Konfirmasi Q1–Q3 | 1 hari |
| M1 | `export_json.py` + `reconcile.py` (lulus) | 2–3 hari |
| M2 | Setup Vite/Tailwind, tipe, fetch layer, tema | 1 hari |
| M3 | Header (fold/user), Summary, Metric cards | 2 hari |
| M4 | Panel rekomendasi & test data + badge + daftar panjang | 2 hari |
| M5 | Toolbar + URL state + state khusus | 1–2 hari |
| M6 | Model Overview + Compare FCM vs NBCF | 2 hari |
| M7 | Responsif, a11y, test, polish untuk laporan | 2 hari |

---

## 15. Asumsi & Pertanyaan Terbuka

**Jawaban yang sudah dipakai:** pred tersedia (F1–F5); ranking Top-100, UI hanya badge Top-10/20; tie by `item_id`; satu konfigurasi (`argmax·fcm·cu2·ci2·hybrid`); relevan ≥ 1; klaster FCM tidak ditampilkan; pembanding NBCF; Latent Discovery dihapus; tujuan laporan.

| # | Pertanyaan | Dampak |
|---|---|---|
| Q1 | **Path pasti** Top-N dan pred: `hasil_akhir/argmax/pred/…` atau `hasil_akhir/ml-100k/argmax/pred/…`? Apakah Top-N juga berada di `hasil_akhir/ml-100k/argmax/topn/F{fold}_fcm_cu2_ci2.parquet` (bukan `ci11`)? Kolom file pred apa saja? | Skrip export |
| Q2 | **NBCF**: di mana file topn/pred/eval-nya, dan apa kolom `method`-nya di eval (mis. `nbcf`)? Apakah tersedia per user (topn & pred) atau hanya eval global? | Delta per user vs fold-avg; toggle Model |
| Q3 | Apakah NBCF dievaluasi pada split dan N yang sama (`u1–u5`, N=10/20)? | Kelayakan perbandingan |
| Q4 | Perlu toggle **Model: FCM/NBCF** di dashboard (melihat rekomendasi NBCF per user), atau cukup sebagai pembanding metrik? | Cakupan v1 vs v1.1 |
