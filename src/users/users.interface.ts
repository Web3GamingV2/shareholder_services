export interface UserProfile {
  user_id: string;
  email?: string; // Email might be sensitive, consider if it should be returned
  wallet_address?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
  // Add other fields from your 'profiles' table here
}
