# FuzzyRescue — Bulanık Mantık Tabanlı Akıllı Karar Destek ve Otonom İHA Yönetim Sistemi

## Proje özeti
FuzzyRescue, İHA görevlerini ve bulanık mantıkla hız kararı üretimini görselleştiren, tarayıcıda çalışan akademik bir simülasyon prototipidir. Dijital ikiz, sentetik telemetri, çoklu İHA görev senaryoları ve A* rota planlama gibi modüller içerir. Deprem sonrası arama ve yardım operasyonu, örnek uygulama senaryolarından biridir; projenin tamamı afet odaklı değildir.

## Dosyalar
- `index.html`: Uygulama arayüzünün HTML yapısı.
- `style.css`: Tüm arayüz tasarımı, renkler ve duyarlı yerleşim.
- `script.js`: Bulanık çıkarım, simülasyon, görselleştirme, rota planlama ve etkileşim kodları.

## Çalıştırma
1. ZIP dosyasını bir klasöre çıkarın.
2. **Üç dosyayı aynı klasörde tutun.**
3. `index.html` dosyasını Chrome, Edge veya Firefox ile açın.
4. İnternet bağlantısı veya kurulum gerektirmeyen yerel bir HTML/CSS/JavaScript uygulamasıdır.

## Teknik yaklaşım
- Bulanık mantık girişleri: batarya seviyesi, engel mesafesi, hedef tespit güveni.
- Çıkış: hız komutu.
- Üç giriş ve giriş başına üç dilsel küme: 3 × 3 × 3 = **27 kural**.
- Mamdani MIN–MAX çıkarım ve centroid (ağırlık merkezi) durulaştırma.
- A* (A yıldız) rota planlama, bulanık çıkarımdan ayrı bir algoritmadır.
- Sentetik veriyle yapılan senaryo testleri, gerçek uçuş başarısının kanıtı değildir.

## Akademik sınırlar
Bu prototip gerçek bir İHA'ya, GPS'e, termal kameraya veya canlı sensör ağına bağlı değildir. Veriler ve operasyonlar simüle edilmektedir. Farklı modüllerin tek bir gerçek zamanlı donanım kontrol sistemi olarak bütünleştiği iddia edilmemelidir.

## Sunum önerisi
Önce bulanık mantık laboratuvarında girişleri ve aktif kuralları gösterin; ardından hız çıktısını, dijital ikizi, 3D filo/A* rotalarını ve son olarak afet uygulama senaryosunu tanıtın.
