import { supabase } from './supabaseClient.ts';

/** * ValidationStatus represents the current state of a field check:
 * - format-error: RegEx failed or input is empty
 * - checking: Database query is in progress
 * - taken: Entry exists in the database
 * - available: Entry is unique and valid
 */
export type ValidationStatus = 'typing' | 'checking' | 'taken' | 'available' | 'format-error';

/**
 * Checks if an email is already registered in the profiles table.
 */
export const checkEmailAvailability = async (email: string): Promise<ValidationStatus> => {
  // 1. Format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const cleanEmail = email?.trim().toLowerCase();

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return 'format-error';
  }

  try {
    // 2. Database Check
    // We use .maybeSingle() to get a single row or null without erroring
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (error) throw error;

    // 3. Conflict check
    return data ? 'taken' : 'available';
  } catch (e) {
    console.error('Email validation error:', e);
    return 'format-error';
  }
};

/**
 * Checks if a username is already taken.
 * IMPORTANT: This prepends the '@' symbol to match the database storage format.
 */
export const checkUsernameAvailability = async (username: string): Promise<ValidationStatus> => {
  // 1. Basic format check (3+ chars, lowercase, numbers, and underscores only)
  const userRegex = /^[a-z0-9_]{3,}$/;
  const cleanUsername = username?.trim().toLowerCase();

  if (!cleanUsername || !userRegex.test(cleanUsername)) {
    return 'format-error';
  }

  // 2. Prefix mapping
  // Since the DB stores usernames as '@handle', we must query with the @ prefix
  const dbUsername = `@${cleanUsername}`;

  try {
    // 3. Database Check
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', dbUsername)
      .maybeSingle();

    if (error) throw error;

    // 4. Conflict check
    return data ? 'taken' : 'available';
  } catch (e) {
    console.error('Username validation error:', e);
    return 'format-error';
  }
};