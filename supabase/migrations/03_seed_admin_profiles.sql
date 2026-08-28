-- ══════════════════════════════════════════════
-- STEP 1: Patch existing regular users
-- Copies their old business_area/role → domains[]/roles[]
-- ══════════════════════════════════════════════
UPDATE public.user_profiles
SET
  domains = ARRAY[business_area],
  roles   = ARRAY[role]
WHERE
  (domains IS NULL OR domains = '{}')
  AND business_area IS NOT NULL
  AND business_area != '';

-- ══════════════════════════════════════════════
-- STEP 2: Give super admins everything
-- ══════════════════════════════════════════════
UPDATE public.user_profiles
SET
  domains       = ARRAY['AI for AD', 'AI for AMS', 'AI for Infra'],
  roles         = ARRAY['Product Owner', 'Developer', 'Support Engineer',
                        'Software Engineer', 'Infra Engineer', 'SRE / NOC Lead'],
  access_status = 'approved'
WHERE email IN (
  'ram.varikuti@tcs.com',
  'saikiran.gutta@tcs.com',
  'surabhi.pavankumar@tcs.com',
  'lavanya.tetakali@tcs.com',
  'vishnu.kosuru@tcs.com',
  'test3@tcs.com',
  'vishnu4916@gmail.com',
  'dinesh.kottakota@tcs.com',
  'sreeja.biswas2@tcs.com',
  'praveen.katta1@tcs.com'
);
