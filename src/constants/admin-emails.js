// Super Admin & Admin Email Addresses
// Users with these emails have Super Admin platform access across all Business Areas & Settings

export const SUPER_ADMIN_EMAILS = [
  'ram.varikuti@tcs.com',
  'saikiran.gutta@tcs.com',
  'surabhi.pavankumar@tcs.com',
  'lavanya.tetakali@tcs.com',
  'vishnu.kosuru@tcs.com',
  'test3@tcs.com',
  'vishnu4916@gmail.com',
  'dinesh.kottakota@tcs.com',
  'sreeja.biswas2@tcs.com',
  'praveen.katta1@tcs.com',
  'slnvsssupriya.daita@tcs.com'
];

// Helper function to check if email is Super Admin
export const isSuperAdminEmail = (email) => {
  if (!email) return false;
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
};

// Backward compatibility alias
export const ADMIN_EMAILS = SUPER_ADMIN_EMAILS;
export const isAdminEmail = isSuperAdminEmail;
