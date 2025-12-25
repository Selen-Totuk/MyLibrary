# MyLibrary
# MyLibrary | Personal Library Management System

MyLibrary, nesne yönelimli programlama prensipleri ve modern web standartları baz alınarak geliştirilmiş, kullanıcıların kişisel kütüphanelerini dijitalize etmelerine olanak tanıyan bir içerik yönetim sistemidir (CMS). Proje, asenkron veri yönetimi ve reaktif kullanıcı arayüzü bileşenlerinin entegrasyonuna odaklanmaktadır.

## 🏗 Mimari ve Teknik Analiz

Projenin teknik altyapısı, yüksek performanslı DOM manipülasyonu ve sürdürülebilir kod mimarisi üzerine kurgulanmıştır:

-   **State Management:** Uygulama durumu (state), tarayıcı belleği ile senkronize bir şekilde yönetilerek veri sürekliliği sağlanmıştır.
-   **Data Persistence:** Kullanıcı verileri, `Web Storage API` kullanılarak JSON formatında serileştirilip yerel depolama birimlerinde (LocalStorage) muhafaza edilmektedir.
-   **UI/UX Design:** Kullanıcı deneyimi, **BEM (Block Element Modifier)** metodolojisine uygun CSS mimarisi ve mobil öncelikli (Mobile-First) yaklaşım ile optimize edilmiştir.
-   **Event Handling:** Bellek yönetimini optimize etmek adına verimli olay dinleyicileri (Event Listeners) ve delegasyon teknikleri kullanılmıştır.

## 🛠 Teknolojik Stack

| Katman | Teknoloji | Fonksiyon |
| :--- | :--- | :--- |
| **Frontend** | HTML5 / CSS3 | Semantik yapı ve Dekoratörler |
| **Scripting** | JavaScript (ES6+) | İş mantığı ve Dinamik Render |
| **Storage** | Web Storage API | Yerel Veri Katmanı |
| **İkonografi** | FontAwesome / Google Icons | Görsel Semantik |

## ⚙️ Temel Modüller ve Fonksiyonel Gereksinimler

-   **Dinamik Veri İşleme:** Kitap bilgilerinin (Başlık, Yazar, Sayfa Sayısı, Okuma Durumu) anlık olarak işlenmesi ve validasyonu.
-   **İleri Seviye Filtreleme:** Büyük veri setleri içinde O(n) zaman karmaşıklığı ile çalışan arama algoritması.
-   **Durum Geçişleri:** Kitapların yaşam döngüsünün (Okunacak -> Okunuyor -> Tamamlandı) dinamik olarak güncellenmesi.
-   **İstatistik Paneli:** (Varsa) Kütüphane doluluk oranı ve okuma alışkanlıklarının görsel analizi.

## 📦 Dağıtım ve Entegrasyon

Sistemin kurulum gereksinimi bulunmamaktadır. Herhangi bir HTTP sunucusu veya yerel dosya sistemi üzerinden doğrudan erişilebilir:

```bash
# Projeyi yerel dizine aktarma
git clone [https://github.com/](https://github.com/)[kullanici-adi]/mylibrary.git

# Uygulama dizinine giriş
cd mylibrary

# Çalıştırma
open index.html
