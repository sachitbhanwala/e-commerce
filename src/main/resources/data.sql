-- Populate product_token for existing products that don't have one
UPDATE products 
SET product_token = UUID() 
WHERE product_token IS NULL OR product_token = '';

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-audio-1',
  'Studio Headphones Pro',
  'https://thegadgetflow.com/wp-content/uploads/2019/05/Status-Audio-CB-1-Professional-Studio-Headphones-01.jpg',
  'AUDIO',
  'Closed-back monitoring headphones',
  'Detailed studio headphones with comfortable pads and neutral tuning for long sessions.',
  12499.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-audio-1'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-audio-2',
  'Portable Audio DAC',
  'https://www.bassheadspeakers.com/wp-content/uploads/2020/03/Audioengine-D1-Portable-Headphone-Amp-Connections.jpg',
  'AUDIO',
  'High-res portable DAC amp',
  'Compact DAC/amp that brings clarity and punch to wired headphones on the go.',
  8999.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-audio-2'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-wear-1',
  'Fitness Band S',
  'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=900&h=900&fit=crop',
  'WEARABLES',
  'Slim fitness tracker',
  'Lightweight band with heart-rate tracking, sleep monitoring, and 7-day battery.',
  5499.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-wear-1'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-wear-2',
  'Sport Smartwatch',
  'https://cdn.mos.cms.futurecdn.net/Lnmif2FCa84PN5PTzR8JDj-480-80.jpg',
  'WEARABLES',
  'GPS + workout companion',
  'Rugged smartwatch with multi-sport tracking, GPS, and 5 ATM water resistance.',
  17999.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-wear-2'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-bags-1',
  'City Tech Backpack',
  'https://kidsbackpackreview.com/wp-content/uploads/2023/07/Top-7-Durable-Tech-Backpacks-20232.png',
  'BAGS',
  'Slim daily commuter bag',
  'Minimal backpack with padded laptop sleeve and waterproof fabric.',
  4999.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-bags-1'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-bags-2',
  'Travel Duffel',
  'https://m.media-amazon.com/images/I/71WT7KlABQL._AC_SL1500_.jpg',
  'BAGS',
  'Weekender duffel',
  'Spacious duffel with shoe compartment and reinforced handles.',
  6399.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-bags-2'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-peri-1',
  'Mechanical Keyboard TKL',
  'https://resource.logitechg.com/d_transparent.gif/content/dam/gaming/en/products/g915-tkl/g915-tkl-gallery-1-carbon.png',
  'PERIPHERALS',
  'Tenkeyless RGB keyboard',
  'Compact mechanical keyboard with hot-swappable switches and metal frame.',
  8599.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-peri-1'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-peri-2',
  'Ergo Vertical Mouse',
  'https://theawesomer.com/photos/2018/08/logitech_mx_vertical_ergonomic_mouse_3.jpg',
  'PERIPHERALS',
  'Ergonomic vertical mouse',
  'Comfort-focused mouse with adjustable DPI and multi-device pairing.',
  3499.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-peri-2'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-store-1',
  'NVMe SSD 1TB',
  'https://image-us.samsung.com/SamsungUS/home/ca-assets-folder/18644/MZ-V9E1T0BW_001_Front_Black_1600x1200.jpg',
  'STORAGE',
  'High-speed internal SSD',
  'PCIe NVMe SSD with fast sequential reads for creators and gamers.',
  9999.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-store-1'
);

INSERT INTO products (product_id, name, image, category, short_description, full_description, price, recommended_only)
SELECT
  'rec-store-2',
  'Backup Drive 2TB',
  'https://i5.walmartimages.com/seo/Seagate-2TB-Backup-Plus-Slim-Portable-External-Hard-Drive-USB-3-0-Black-STHN2000400_76c8e52c-f077-4ef6-a471-f07af3ead459_1.70aabbb984c117c096d00b2bebb9e0ee.jpeg',
  'STORAGE',
  'Portable backup drive',
  'Durable backup drive with USB-C and password protection.',
  7499.00,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM products WHERE product_id = 'rec-store-2'
);

-- Insert sample secondary images for testing the gallery
INSERT INTO product_images (product_id, image_url)
SELECT p.id, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
FROM products p WHERE p.product_id = 'rec-audio-1'
  AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = p.id);

INSERT INTO product_images (product_id, image_url)
SELECT p.id, 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
FROM products p WHERE p.product_id = 'rec-audio-1'
  AND (SELECT COUNT(*) FROM product_images pi WHERE pi.product_id = p.id) < 2;

INSERT INTO users (name, email, password_hash, role, created_at)
SELECT
  'sachit',
  'sachitbhanwala46@gmail.com',
  '$2a$10$r9h6cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
  'ADMIN',
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sachitbhanwala46@gmail.com'
);

-- Copy admin from users to admins table
INSERT INTO admins (created_at, email, name, password_hash, role)
SELECT created_at, email, name, password_hash, role
FROM users
WHERE role = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM admins WHERE email = users.email);

-- Remove admins from users table
DELETE FROM users WHERE role = 'ADMIN';

-- Explicitly add the requested second admin immediately to the admins table
INSERT INTO admins (created_at, email, name, password_hash, role)
SELECT NOW(), 'sachitbhanwala276@gmail.com', 'Sachit Admin', '$2a$10$wT.fB.vQjEKqJwN7W.r4jOHXZa/Z1s0M07o47/CgOQcE28gP2V6Ym', 'ADMIN'
WHERE NOT EXISTS (SELECT 1 FROM admins WHERE email = 'sachitbhanwala276@gmail.com');