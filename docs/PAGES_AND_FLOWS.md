# Complete Site Map & User Flows

## All Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Log in |
| `/signup` | Role selection (candidate vs employer) |
| `/signup/candidate` | Candidate registration |
| `/signup/employer` | Employer registration |
| `/forgot-password` | Request password reset email |
| `/auth/callback` | Handles Supabase redirect (password reset) |
| `/dashboard/candidate` | Candidate dashboard – jobs list, profile |
| `/dashboard/employer` | Employer dashboard – post jobs, view listings |
| `/profile/candidate` | Edit candidate profile |
| `/profile/employer` | Edit company profile |
| `/settings` | Account settings (change password) |
| `/jobs/[id]` | Job detail – view & apply |
| `/jobs/[id]/applicants` | Employer view of applicants |
| `/not-found` | 404 page |

## Password Recovery Flow

1. User clicks **Forgot password?** on login.
2. Goes to `/forgot-password`, enters email.
3. Supabase sends email with reset link.
4. Link redirects to `/auth/callback` with recovery tokens.
5. User sees **Set new password** form.
6. Submits new password → redirected to login with success message.

**Important:** Add `http://localhost:3000/auth/callback` to Supabase **Redirect URLs** (Authentication → URL Configuration). See `SUPABASE_CONFIG.md`.

## Functional Flows

### Candidate
- Sign up → Create profile → Dashboard → Browse jobs → View job → Apply → Edit profile → Change password

### Employer
- Sign up → Create company → Dashboard → Post job → View applicants → Edit profile → Change password
