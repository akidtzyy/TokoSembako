-- ============================================================
-- Toko Sembako - MySQL Schema & Seed Data
-- Jalankan file ini sekali untuk setup database
-- ============================================================

-- Buat database jika belum ada
CREATE DATABASE IF NOT EXISTS toko_sembako 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE toko_sembako;

-- ============================================================
-- TABEL PRODUK
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price INT NOT NULL DEFAULT 0,
  cost INT NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'Pcs',
  image TEXT,
  is_popular TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL SUPPLIER
-- ============================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  contact VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL STOK
-- ============================================================
CREATE TABLE IF NOT EXISTS stocks (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  supplier_id VARCHAR(50),
  supplier_name VARCHAR(255) DEFAULT 'Tanpa Supplier',
  stock_min INT NOT NULL DEFAULT 10,
  stock_actual INT NOT NULL DEFAULT 0,
  last_updated DATE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL PENJUALAN
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id VARCHAR(50) PRIMARY KEY,
  invoice VARCHAR(100) NOT NULL UNIQUE,
  sale_date DATE NOT NULL,
  total_amount INT NOT NULL DEFAULT 0,
  cashier VARCHAR(100),
  payment_method VARCHAR(50) DEFAULT 'Tunai',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL ITEM PENJUALAN (detail tiap transaksi)
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sale_id VARCHAR(50) NOT NULL,
  product_id VARCHAR(50),
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  price INT NOT NULL DEFAULT 0,
  total INT NOT NULL DEFAULT 0,
  FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL PENGUMUMAN
-- ============================================================
CREATE TABLE IF NOT EXISTS announcements (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  ann_date DATE NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABEL AUTENTIKASI USER
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'User',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA DEFAULT
-- ============================================================

-- Users
INSERT IGNORE INTO users (username, name, role) VALUES
  ('admin', 'Dika (Admin)', 'Owner'),
  ('kasir', 'Kasir Toko', 'User');

-- Suppliers
INSERT IGNORE INTO suppliers (id, code, name, contact, email, address) VALUES
  ('s1', 'SPL-001', 'PT Sinar Mas Distribusi', '0812-3456-7890', 'info@sinarmasdist.com', 'Jl. Industri No. 12, Jakarta Utara'),
  ('s2', 'SPL-002', 'CV Pangan Makmur', '0857-9988-7766', 'marketing@panganmakmur.com', 'Kawasan Industri Candi Blok B-4, Semarang'),
  ('s3', 'SPL-003', 'PT Indofood CBP Sukses Makmur', '021-5701500', 'corporate@indofood.co.id', 'Sudirman Plaza, Indofood Tower, Jakarta Selatan'),
  ('s4', 'SPL-004', 'UD Tani Sejahtera', '0821-4433-2211', 'tanisejahtera.ud@gmail.com', 'Jl. Raya Agro No. 8, Cianjur');

-- Products (24 produk)
INSERT IGNORE INTO products (id, code, name, category, price, cost, unit, image, is_popular) VALUES
  ('p1',  'BRG-001', 'Beras Pandan Wangi Super 5kg',           'Beras & Gandum',          78000, 68000, 'Karung',  'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/MTA-21601792/day_2_day_day_2_day_beras_pandan_wangi_5kg_full02_kdy0teci.jpeg', 1),
  ('p2',  'BRG-002', 'Beras Cianjur Kepala Selera 5kg',        'Beras & Gandum',          74000, 65000, 'Karung',  'https://i0.wp.com/raisa.aeonstore.id/wp-content/uploads/2023/05/3899182.jpg?fit=700%2C700&ssl=1', 0),
  ('p3',  'BRG-003', 'Beras Merah Organik Sehat 1kg',          'Beras & Gandum',          28000, 23000, 'Bungkus', 'https://down-id.img.susercontent.com/file/id-11134207-81ztc-mefelguylbls1d', 0),
  ('p4',  'BRG-004', 'Tepung Terigu Segitiga Biru 1kg',        'Beras & Gandum',          14500, 12500, 'Bungkus', 'https://order.lottemart.co.id/_next/image?url=https%3A%2F%2Fcoreimages.lottemart.co.id%2Ford%2F06%2F1017239000&w=1920&q=75', 1),
  ('p5',  'BRG-005', 'Tepung Cakra Kembar Premium 1kg',        'Beras & Gandum',          15500, 13000, 'Bungkus', 'https://solvent-production.s3.amazonaws.com/media/images/products/2021/04/2031a.jpg', 0),
  ('p6',  'BRG-006', 'Tepung Beras Rose Brand 500g',           'Beras & Gandum',           8500,  7000, 'Bungkus', 'https://order.lottemart.co.id/_next/image?url=https%3A%2F%2Fcoreimages.lottemart.co.id%2Ford%2F06%2F1035633000&w=1920&q=75', 0),
  ('p7',  'BRG-007', 'Tepung Ketan Putih Rose Brand 500g',     'Beras & Gandum',           9500,  8000, 'Bungkus', 'https://id-test-11.slatic.net/p/b665b4102760d9b997e6803c17507e27.jpg', 0),
  ('p8',  'BRG-008', 'Tepung Maizena Maizenaku 250g',          'Beras & Gandum',           6500,  5200, 'Bungkus', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8VSVAfTsumUjpmt6T37H-sU8eHk2ojnCfIVbVefaeIw&s', 0),
  ('p9',  'BRG-009', 'Gandum Oatmeal Quaker Merah 800g',       'Beras & Gandum',          46000, 41000, 'Kotak',   'https://down-id.img.susercontent.com/file/2548f65524abc55637d4f5033e406dd4', 0),
  ('p10', 'MNG-001', 'Minyak Goreng Bimoli Spesial 2L',        'Minyak Goreng & Mentega', 38500, 34000, 'Pouch',   'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//94/MTA-3406188/bimoli_bimoli-2ltr-special-refill_full02.jpg', 1),
  ('p11', 'MNG-002', 'Minyak Goreng Sania Premium 1L',         'Minyak Goreng & Mentega', 19500, 17000, 'Pouch',   'https://image.astronauts.cloud/product-images/2024/4/SaniaMinyakGorengPouchCookingOil1_aba7b712-6490-4645-88bb-b23d1ad2a54b_900x900.png', 0),
  ('p12', 'MNG-003', 'Margarin Blue Band Serbaguna 200g',      'Minyak Goreng & Mentega',  9200,  7800, 'Sachet',  'https://down-id.img.susercontent.com/file/id-11134207-7r991-lqvajygh5w3x6e', 1),
  ('p13', 'MNG-004', 'Simas Margarin Dapur 200g',              'Minyak Goreng & Mentega',  6500,  5200, 'Sachet',  'https://coreimages.lottemart.co.id/ord/06/1084348000', 0),
  ('p14', 'MNG-005', 'Minyak Wijen Lee Kum Kee 115ml',         'Minyak Goreng & Mentega', 29000, 25000, 'Botol',   'https://image.astronauts.cloud/product-images/2024/4/LeeKumKeeMinyakWijen115mlSesameOil1_76fba4b8-7455-46f4-a8c5-d55c2966dfe2_900x900.png', 0),
  ('p15', 'MNG-060', 'Minyak Zaitun Bertolli Extra Virgin 250ml','Minyak Goreng & Mentega',65000, 57000, 'Botol',   'https://down-id.img.susercontent.com/file/180bb3b42b97a118b61abfd1ff641940', 0),
  ('p16', 'GUL-001', 'Gula Pasir Gulaku Putih Premium 1kg',    'Gula & Pemanis',          17500, 15000, 'Bungkus', 'https://media.monotaro.id/mid01/big/Perlengkapan%20Dapur%20%26%20Horeka/Makanan/Gula/Gula%20Pasir/Gulaku%20Gula%20Pasir%20Premium%20Putih%20(Sugar)/80P101558288-34.jpg', 1),
  ('p17', 'GUL-002', 'Gula Pasir Rose Brand Kuning 1kg',       'Gula & Pemanis',          16800, 14500, 'Bungkus', 'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//104/MTA-57537049/rose-brand_gula-rosebrand-1-kg-kuning_full01.jpg', 0),
  ('p18', 'GUL-003', 'Gula Batu Super Manis Alami 500g',       'Gula & Pemanis',          12000,  9800, 'Bungkus', 'https://p16-oec-sg.ibyteimg.com/tos-alisg-i-aphluv4xwc-sg/047617fbc02849ffb7b9a0847a3ffe31~tplv-aphluv4xwc-white-pad-v1:500:500.jpeg', 0),
  ('p19', 'GUL-004', 'Sirup Marjan Boudoin Cocopandan 460ml',  'Gula & Pemanis',          22500, 19000, 'Botol',   'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full/catalog-image/106/MTA-184363657/no_brand_marjan_boudoin_syrup_rasa_cocopandan_460ml_full01_lzu4b44y.webp', 1),
  ('p20', 'GUL-005', 'Sirup ABC Squash Orange Segar 460ml',    'Gula & Pemanis',          14500, 12000, 'Botol',   'https://www.static-src.com/wcsstore/Indraprastha/images/catalog/full//92/MTA-21780118/abc_abc-syrup-squash-orange-460ml-btl_full01.jpg', 0),
  ('p21', 'MIE-001', 'Indomie Goreng Spesial Murah',           'Mie & Pasta',              3100,  2600, 'Pcs',     'https://image.astronauts.cloud/product-images/2024/4/IndomieGorengSpesialMieinstan1_19ed38d5-421f-4813-bd66-25cf83f1909c_900x900.png', 1),
  ('p22', 'MIE-002', 'Indomie Kuah Soto Mie Gurih',            'Mie & Pasta',              3000,  2550, 'Pcs',     'https://c.alfagift.id/product/1/1_A09430004766_20210705132929931_base.jpg', 1),
  ('p23', 'SSU-001', 'Susu Kental Manis Frisian Flag Emas 370g','Susu & Olahan Susu',     12500, 10800, 'Kaleng',  'https://www.frisianflag.com/storage/app/media/Produk/BKM-545gr.png', 1),
  ('p24', 'SSU-002', 'Susu UHT Ultra Milk Full Cream 1L',      'Susu & Olahan Susu',      18500, 16000, 'Kotak',   'https://tokoelmanna.com/wp-content/uploads/2021/04/uht-plain.jpg', 1);

-- Stok (sesuai produk)
INSERT IGNORE INTO stocks (id, product_id, product_name, supplier_id, supplier_name, stock_min, stock_actual, last_updated) VALUES
  ('st_p1',  'p1',  'Beras Pandan Wangi Super 5kg',           's4', 'UD Tani Sejahtera',              20, 40,  '2026-02-24'),
  ('st_p2',  'p2',  'Beras Cianjur Kepala Selera 5kg',        's4', 'UD Tani Sejahtera',              20, 52,  '2026-02-24'),
  ('st_p3',  'p3',  'Beras Merah Organik Sehat 1kg',          's4', 'UD Tani Sejahtera',              20, 64,  '2026-02-24'),
  ('st_p4',  'p4',  'Tepung Terigu Segitiga Biru 1kg',        's4', 'UD Tani Sejahtera',              20, 76,  '2026-02-24'),
  ('st_p5',  'p5',  'Tepung Cakra Kembar Premium 1kg',        's4', 'UD Tani Sejahtera',              30,  8,  '2026-02-24'),
  ('st_p6',  'p6',  'Tepung Beras Rose Brand 500g',           's4', 'UD Tani Sejahtera',              20, 100, '2026-02-24'),
  ('st_p7',  'p7',  'Tepung Ketan Putih Rose Brand 500g',     's4', 'UD Tani Sejahtera',              20, 112, '2026-02-24'),
  ('st_p8',  'p8',  'Tepung Maizena Maizenaku 250g',          's4', 'UD Tani Sejahtera',              20, 124, '2026-02-24'),
  ('st_p9',  'p9',  'Gandum Oatmeal Quaker Merah 800g',       's2', 'CV Pangan Makmur',               20, 40,  '2026-02-24'),
  ('st_p10', 'p10', 'Minyak Goreng Bimoli Spesial 2L',        's1', 'PT Sinar Mas Distribusi',        20, 52,  '2026-02-24'),
  ('st_p11', 'p11', 'Minyak Goreng Sania Premium 1L',         's2', 'CV Pangan Makmur',               20, 64,  '2026-02-24'),
  ('st_p12', 'p12', 'Margarin Blue Band Serbaguna 200g',      's2', 'CV Pangan Makmur',               30,  8,  '2026-02-24'),
  ('st_p13', 'p13', 'Simas Margarin Dapur 200g',              's2', 'CV Pangan Makmur',               20, 88,  '2026-02-24'),
  ('st_p14', 'p14', 'Minyak Wijen Lee Kum Kee 115ml',         's1', 'PT Sinar Mas Distribusi',        20, 100, '2026-02-24'),
  ('st_p15', 'p15', 'Minyak Zaitun Bertolli Extra Virgin 250ml','s2','CV Pangan Makmur',              20, 112, '2026-02-24'),
  ('st_p16', 'p16', 'Gula Pasir Gulaku Putih Premium 1kg',    's2', 'CV Pangan Makmur',               20, 40,  '2026-02-24'),
  ('st_p17', 'p17', 'Gula Pasir Rose Brand Kuning 1kg',       's2', 'CV Pangan Makmur',               20, 52,  '2026-02-24'),
  ('st_p18', 'p18', 'Gula Batu Super Manis Alami 500g',       's1', 'PT Sinar Mas Distribusi',        20, 64,  '2026-02-24'),
  ('st_p19', 'p19', 'Sirup Marjan Boudoin Cocopandan 460ml',  's2', 'CV Pangan Makmur',               20, 76,  '2026-02-24'),
  ('st_p20', 'p20', 'Sirup ABC Squash Orange Segar 460ml',    's2', 'CV Pangan Makmur',               20, 88,  '2026-02-24'),
  ('st_p21', 'p21', 'Indomie Goreng Spesial Murah',           's3', 'PT Indofood CBP Sukses Makmur',  20, 100, '2026-02-24'),
  ('st_p22', 'p22', 'Indomie Kuah Soto Mie Gurih',            's3', 'PT Indofood CBP Sukses Makmur',  20, 112, '2026-02-24'),
  ('st_p23', 'p23', 'Susu Kental Manis Frisian Flag Emas 370g','s2','CV Pangan Makmur',              20, 40,  '2026-02-24'),
  ('st_p24', 'p24', 'Susu UHT Ultra Milk Full Cream 1L',      's2', 'CV Pangan Makmur',               20, 52,  '2026-02-24');

-- Sales
INSERT IGNORE INTO sales (id, invoice, sale_date, total_amount, cashier, payment_method) VALUES
  ('t1',  'TRX-20260224-001', '2026-02-24', 194500, 'Dika (Admin)', 'Tunai'),
  ('t2',  'TRX-20260224-002', '2026-02-24', 101000, 'Dika (Admin)', 'QRIS'),
  ('t3',  'TRX-20260223-001', '2026-02-23', 106000, 'Dika (Admin)', 'Transfer Bank'),
  ('t4',  'TRX-20260222-001', '2026-02-22', 312000, 'Dika (Admin)', 'Tunai'),
  ('t5',  'TRX-20260221-001', '2026-02-21', 154000, 'Dika (Admin)', 'QRIS'),
  ('t6',  'TRX-20260220-001', '2026-02-20',  73500, 'Dika (Admin)', 'Tunai'),
  ('t7',  'TRX-20260218-001', '2026-02-18', 116000, 'Dika (Admin)', 'Transfer Bank'),
  ('t8',  'TRX-20260215-001', '2026-02-15', 188000, 'Dika (Admin)', 'Tunai'),
  ('t9',  'TRX-20260210-001', '2026-02-10', 390000, 'Dika (Admin)', 'QRIS'),
  ('t10', 'TRX-20260205-001', '2026-02-05', 185000, 'Dika (Admin)', 'Tunai'),
  ('t11', 'TRX-20260128-001', '2026-01-28', 321500, 'Dika (Admin)', 'Transfer Bank'),
  ('t12', 'TRX-20260125-001', '2026-01-25', 231000, 'Dika (Admin)', 'Tunai'),
  ('t13', 'TRX-20260120-001', '2026-01-20', 120000, 'Dika (Admin)', 'QRIS'),
  ('t14', 'TRX-20260115-001', '2026-01-15', 126000, 'Dika (Admin)', 'Tunai'),
  ('t15', 'TRX-20260110-001', '2026-01-10', 318000, 'Dika (Admin)', 'Transfer Bank'),
  ('t16', 'TRX-20260105-001', '2026-01-05', 145000, 'Dika (Admin)', 'Tunai');

-- Sale Items
INSERT IGNORE INTO sale_items (sale_id, product_id, product_name, quantity, price, total) VALUES
  ('t1',  'p1',  'Beras Pandan Wangi Super 5kg',           2, 78000,  156000),
  ('t1',  'p10', 'Minyak Goreng Bimoli Spesial 2L',        1, 38500,   38500),
  ('t2',  'p21', 'Indomie Goreng Spesial Murah',          10,  3100,   31000),
  ('t2',  'p16', 'Gula Pasir Gulaku Putih Premium 1kg',    4, 17500,   70000),
  ('t3',  'p23', 'Susu Kental Manis Frisian Flag Emas 370g',5,12500,   62500),
  ('t3',  'p4',  'Tepung Terigu Segitiga Biru 1kg',        3, 14500,   43500),
  ('t4',  'p1',  'Beras Pandan Wangi Super 5kg',           4, 78000,  312000),
  ('t5',  'p11', 'Minyak Goreng Sania Premium 1L',         2, 19500,   39000),
  ('t5',  'p14', 'Minyak Wijen Lee Kum Kee 115ml',         1, 29000,   29000),
  ('t6',  'p13', 'Simas Margarin Dapur 200g',              3,  6500,   19500),
  ('t7',  'p21', 'Indomie Goreng Spesial Murah',           8,  3100,   24800),
  ('t8',  'p4',  'Tepung Terigu Segitiga Biru 1kg',        5, 14500,   72500),
  ('t8',  'p10', 'Minyak Goreng Bimoli Spesial 2L',        3, 38500,  115500),
  ('t9',  'p1',  'Beras Pandan Wangi Super 5kg',           5, 78000,  390000),
  ('t10', 'p24', 'Susu UHT Ultra Milk Full Cream 1L',     10, 18500,  185000),
  ('t11', 'p1',  'Beras Pandan Wangi Super 5kg',           3, 78000,  234000),
  ('t11', 'p16', 'Gula Pasir Gulaku Putih Premium 1kg',    5, 17500,   87500),
  ('t12', 'p10', 'Minyak Goreng Bimoli Spesial 2L',        6, 38500,  231000),
  ('t13', 'p22', 'Indomie Kuah Soto Mie Gurih',           40,  3000,  120000),
  ('t14', 'p23', 'Susu Kental Manis Frisian Flag Emas 370g',12,10500, 126000),
  ('t15', 'p19', 'Sirup Marjan Boudoin Cocopandan 460ml',  2, 22500,   45000),
  ('t15', 'p20', 'Sirup ABC Squash Orange Segar 460ml',    2, 14500,   29000),
  ('t16', 'p4',  'Tepung Terigu Segitiga Biru 1kg',       10, 14500,  145000);

-- Pengumuman
INSERT IGNORE INTO announcements (id, title, content, ann_date, is_active) VALUES
  ('a1', 'Promo Sembako Murah', 'Diskon 10% untuk pembelian Beras Pandan Wangi setiap hari Jumat Berkah!', '2026-02-20', 1);
