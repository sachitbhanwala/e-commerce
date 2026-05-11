-- Database Migration Script for product_token column
-- Run this in MySQL before starting the application

-- Step 1: Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Step 2: Temporarily make product_token nullable if it exists
ALTER TABLE products MODIFY COLUMN product_token VARCHAR(36) NULL;

-- Step 3: Populate NULL values with UUIDs
UPDATE products 
SET product_token = UUID() 
WHERE product_token IS NULL;

-- Step 4: Make product_token NOT NULL
ALTER TABLE products MODIFY COLUMN product_token VARCHAR(36) NOT NULL;

-- Step 5: Add UNIQUE constraint if it doesn't exist
ALTER TABLE products ADD UNIQUE KEY uk_product_token (product_token);

-- Step 6: Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;
