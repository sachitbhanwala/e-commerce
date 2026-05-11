-- Populate product_token for existing products that don't have one
UPDATE products 
SET product_token = UUID() 
WHERE product_token IS NULL OR product_token = '';
