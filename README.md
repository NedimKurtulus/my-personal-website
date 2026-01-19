# Full-Stack Personal Management System

Bu proje, modern web teknolojileri kullanılarak geliştirilmiş, ölçeklenebilir ve modüler bir kişisel yönetim sistemidir. Backend tarafında **NestJS**'in güçlü mimarisi, frontend tarafında ise **React**'in esnekliği kullanılmıştır.

## Öne Çıkan Teknik Özellikler

* **Modüler Backend Mimarisi:** NestJS ile Dependency Injection ve modüler yapı prensiplerine uygun geliştirme.
* **Veritabanı ve ORM:** TypeORM/SQLite (veya PostgreSQL) entegrasyonu ile veri modelleme ve yönetimi.
* **RESTful API Tasarımı:** Standartlara uygun, sürdürülebilir API uç noktaları.
* **Kimlik Doğrulama:** JWT (JSON Web Token) tabanlı güvenli oturum yönetimi.
* **Full-Stack Entegrasyon:** Frontend ve Backend arasında verimli veri akışı ve asenkron operasyon yönetimi.

##  Kullanılan Teknolojiler

### Backend
* **Framework:** NestJS
* **Dil:** TypeScript
* **Veritabanı:** SQLite / PostgreSQL
* **Araçlar:** TypeORM, Passport.js, JWT

### Frontend
* **Framework:** React.js
* **State Management:** React Hooks
* **Styling:** CSS3 / Tailwind CSS (isteğe bağlı)

##  Kurulum ve Çalıştırma

Projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyebilirsiniz:

### 1. Depoyu Klonlayın
```bash
git clone [https://github.com/NedimKurtulus/my-personal-website.git](https://github.com/NedimKurtulus/my-personal-website.git)
cd my-personal-website
```bash
### 2. Backend Kurulumu
Bash

cd backend
npm install
npm run start:dev
3. Frontend Kurulumu
Bash

cd ../frontend
npm install
npm start
