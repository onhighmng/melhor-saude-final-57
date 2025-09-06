-- Update the existing user to have HR role
UPDATE profiles 
SET role = 'hr', updated_at = now() 
WHERE email = 'lorinofrodriguesjunior@gmail.com';