Terima kasih atas jawaban dan klarifikasi Anda yang sangat mendetail! Berdasarkan konfirmasi Anda:

  

1. Kartu **MAP** diganti menjadi **Recall@N**.
    
      
    
2. Filter **Genre** murni menggunakan 19 genre standar dari `README.md` (menggunakan _multi-select dropdown_).
    
      
    
3. Ditambahkan **Dropdown Model (FCM vs NBCF)** di UI untuk memperbarui seluruh daftar panel kiri dan kanan secara instan.
    
      
    
4. Path dataset dan parameter terkonfirmasi menggunakan **`cu2_ci11`** (bukan `ci2` seperti draft sebelumnya), dan prediksi FCM menggunakan kolom **`pred_hybrid`**.
    
      
    
5. Pengurutan saat skor prediksi sama (tie) dikonfirmasi menggunakan **`item_id`**.
    
      
    

Berikut adalah dokumen **`PRD.md` (Versi 1.0 Final)** yang telah diperbarui secara komprehensif agar Anda dapat langsung menggunakannya sebagai acuan pengembangan.

  

# PRD — Movie Recommendation System Dashboard (MovieLens 100K)

|||
|---|---|
|**Versi**|1.0 (Final)|
|**Tanggal**|20 Oktober 2026|
|**Stack**|React 18 + TypeScript + Vite + Tailwind CSS|
|**Dataset**|MovieLens 100K (GroupLens, Univ. of Minnesota)|
|**Model**|1. **FCM** (`mode=argmax`, `cu=2`, `ci=11`, `variant=hybrid`)<br>  <br>  <br><br>2. **NBCF** (sebagai pembanding)|
|**Tujuan akhir**|Laporan riset (demo lokal + tangkapan layar)|

## 1. Ringkasan & Tujuan

Dashboard analitik untuk mengevaluasi dan membandingkan hasil sistem rekomendasi **FCM (Fuzzy C-Means) Hybrid** melawan **NBCF (Naive Bayes Collaborative Filtering)**.

  

Untuk setiap _fold_ dan _user_, dashboard akan menampilkan:

  

1. **Dropdown Pemilih Model** untuk beralih instan antara hasil FCM dan NBCF.
    
      
    
2. **Top-N Rekomendasi** (Panel Kiri) dengan prediksi rating.
    
      
    
3. **Data Test Aktual** (Panel Kanan) milik user yang sama, dengan informasi rating aktual, prediksi model terpilih, dan selisihnya (Δ).
    
      
    
4. **Skor Evaluasi per User** (NDCG, Precision, Recall, RMSE).
    
      
    
5. **Ringkasan Global** untuk rata-rata 5 fold.
    
      
    

## 2. Sumber Data & Struktur File

Seluruh data akan diproses secara _offline_ dari _file parquet_ menjadi JSON statis.

  

|**Sumber**|**Path File Asli (Contoh untuk Fold 1)**|**Skema & Keterangan**|
|---|---|---|
|**Top-N (FCM)**|`hasil_akhir\ml-100k\argmax\topn\F1_fcm_cu2_ci11.parquet`|`user_id, rank, item_id, predicted_rating`|
|**Top-N (NBCF)**|`hasil_akhir\ml-100k\argmax\topn\F1_nbcf.parquet`|`user_id, rank, item_id, predicted_rating`|
|**Prediksi (FCM)**|`hasil_akhir\ml-100k\argmax\pred\F1_fcm_cu2_ci11.parquet`|Ambil nilai dari kolom **`pred_hybrid`**|
|**Prediksi (NBCF)**|`hasil_akhir\ml-100k\argmax\pred\F1_nbcf.parquet`|Ambil prediksi NBCF|
|**Evaluasi**|`hasil_akhir\ml-100k\eval\argmax_F1.parquet`|Filter `method="fcm"`/`"nbcf"`, `task="topn"`, `variant="hybrid"`|
|**Train / Test**|`ml-100k/u1.base` dan `ml-100k/u1.test`|`user_id \| item_id \| rating \| timestamp`|
|**Item (Genre)**|`ml-100k/u.item`|19 Genre standar MovieLens|
|**User**|`ml-100k/u.user`|`user_id \| age \| gender \| occupation`|

_Catatan: Tie-breaking (skor prediksi sama) diurutkan berdasarkan `item_id` dari terkecil ke terbesar._

  

## 3. Fitur Utama & Kebutuhan UI (User Stories)

|**ID**|**Kebutuhan Fitur**|**Keterangan**|
|---|---|---|
|**US-1**|**Global Selectors**|Memilih **Fold (1–5)**, **User ID** (dengan pencarian), dan **Model (FCM / NBCF)** di Header.|
|**US-2**|**Multi-select Genre Filter**|Filter daftar film menggunakan murni 19 genre standar dari ML-100K (_Action, Adventure, Animation, Children's, Comedy, Crime, Documentary, Drama, Fantasy, Film-Noir, Horror, Musical, Mystery, Romance, Sci-Fi, Thriller, War, Western, Unknown_).|
|**US-3**|**Panel Kiri (Rekomendasi)**|Menampilkan daftar Top-10/Top-20. Baris di-highlight biru jika _hit_ (film ada di data test).|
|**US-4**|**Panel Kanan (Test Aktual)**|Menampilkan film aktual di data test. Jika masuk Top-10/20, beri _badge_. Tampilkan status _Exact Match_ jika rating aktual = prediksi. Scroll internal jika list panjang.|
|**US-5**|**Kartu Metrik (UI)**|Menampilkan 4 kartu: **NDCG@N**, **Precision@N**, **RMSE**, dan **Recall@N** (menggantikan MAP). Tampilkan panah Δ (hijau/merah) yang membandingkan performa model terpilih vs model satunya.|
|**US-6**|**Interaksi State**|Toolbar untuk mengubah opsi **N (10/20)**, Dropdown **Sort** (_Default, Prediksi, Aktual, Tahun_), dan Toggle **Match Highlight**.|

## 4. Perbedaan Desain UI vs Implementasi Final

Berdasarkan dataset dan diskusi, UI di mockup akan disesuaikan sebagai berikut:

  

1. **Model Toggle:** Ditambahkan di atas UI agar seluruh metrik, Top-N, dan prediksi mengikuti model yang dipilih.
    
      
    
2. **Kartu MAP:** Diubah label dan datanya menjadi **Recall@N**.
    
      
    
3. **Genre Label:** Genre eksotis di desain (seperti _Neo-Noir_) diganti murni menggunakan nama 19 genre resmi.
    
      
    
4. **Badge Latent Discovery:** Dihilangkan sepenuhnya (hanya menggunakan badge _Ground Truth Match_).
    
      
    
5. **Score Tambahan:** Kolom _Score_ desimal di mockup dihapus karena prediksi parquet menggunakan format integer. Bintang akan menyesuaikan `predicted_rating` integer.
    
      
    

## 5. Kontrak Data JSON (Arsitektur Frontend)

Karena UI memerlukan _switching_ model yang cepat, struktur file per-fold (`F1.json`) akan membungkus data `fcm` dan `nbcf` di bawah _object_ `models`.

  

**Struktur `public/data/folds/F1.json`:**

  

JSON

```
{
  "fold": 1,
  "users": [
    {
      "id": 1,
      "profile": { "age": 24, "gender": "M", "occupation": "technician" },
      "trainCount": 135,
      "testCount": 44,
      "affinity": [ { "genre": "Drama", "pct": 41 }, { "genre": "Action", "pct": 22 } ],
      "models": {
        "fcm": {
          "recommendations": [
            { "rank": 1, "movieId": 10, "predictedRating": 5, "hit": true, "actualRating": 4 }
          ],
          "testItems": [
            { "movieId": 10, "actualRating": 4, "predictedRating": 5, "modelRank": 1, "timestamp": 875072484 }
          ],
          "metrics": {
            "10": { "hits": 1, "precision": 0.1, "recall": 0.024, "ndcg": 0.112 },
            "20": { "hits": 2, "precision": 0.09, "recall": 0.048, "ndcg": 0.105 },
            "rating": { "rmse": 1.15, "mae": 0.89 }
          }
        },
        "nbcf": {
          "recommendations": [ ... ],
          "testItems": [ ... ],
          "metrics": { ... }
        }
      }
    }
  ]
}
```

_Dengan skema ini, ketika pengguna mengubah toggle "Model" di UI, React cukup mengganti referensi state dari `user.models.fcm` menjadi `user.models.nbcf` tanpa melakukan fetch ulang._

  

## 6. Logika Evaluasi & Validasi UI

UI harus mematuhi logika dari file _parquet_ saat proses export ke JSON:

  

- **Prediksi FCM:** Wajib diekstrak dari kolom `pred_hybrid`.
    
      
    
- **Tie-breaking (Urutan):** Otomatis mengikuti `item_id` (sudah ter-sort di _parquet_, script export cukup mempertahankan urutannya).
    
      
    
- **Hit & Relevansi:** Sebuah rekomendasi disebut _hit_ asalkan item tersebut berada di data test milik user bersangkutan (nilai aktual rating bebas/minimal 1).
    
      
    
- **NDCG:** Rumus _Ideal DCG_ (IDCG) menggunakan rasio standar: `IDCG@10 = 4.5434` dan `IDCG@20 = 7.0386`.
    
      
    

## 7. Milestone & Komponen React

**Tumpukan Teknologi:** `Vite` + `React 18` + `Tailwind CSS` + `lucide-react` + `Headless UI`.

  

|**Komponen**|**Penjelasan**|
|---|---|
|`Dashboard.tsx`|Halaman utama menampung _state_ global (`fold`, `userId`, `model`, `N`).|
|`Header.tsx`|Pemilih Fold, Input/Search User ID, dan **Toggle Model (FCM/NBCF)**.|
|`MetricCards.tsx`|4 Kartu: NDCG@N, P@N, Recall@N, RMSE. Menghitung otomatis nilai Δ dari membandingkan objek model `fcm` vs `nbcf` di JSON.|
|`Toolbar.tsx`|Dropdown Multi-select untuk 19 Genre, Sortir, Toggle 10/20.|
|`ListPanel.tsx`|Panel fleksibel untuk me-render daftar Kiri (Rekomendasi) dan Kanan (Test Aktual).|

**Pengujian Kritis:**

  

- Pastikan jika User X tidak memiliki _hit_ (0 Hits), UI tetap stabil dan tidak _crash_. Tampilkan teks yang elegan ("_0 Hits in Test Set_").
    
      
    
- Pastikan Multi-select filter Genre berjalan secara _Intersection_ (AND) atau _Union_ (OR) sesuai kesepakatan desain, dengan pesan "_Tidak ada film yang cocok_" jika kosong.
    
      
    

_Dokumen PRD Final ini siap digunakan untuk tahap eksekusi kode frontend._