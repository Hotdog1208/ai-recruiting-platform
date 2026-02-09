# Supabase Configuration for Password Recovery

For password reset emails to work correctly, configure these settings in your **Supabase Dashboard**:

## 1. URL Configuration

Go to **Authentication** → **URL Configuration**

### Site URL
Set to your app URL:
- Local: `http://localhost:3000`
- Production: `https://yourdomain.com`

### Redirect URLs
Add these URLs to the allowed list:
- `http://localhost:3000/auth/callback`
- `http://127.0.0.1:3000/auth/callback`
- Your production URL: `https://yourdomain.com/auth/callback`

## 2. Email Templates (optional)

Go to **Authentication** → **Email Templates** → **Reset Password**

You can customize the email body. The link will automatically use your configured redirect URL.

## Flow

1. User clicks "Forgot password?" on login page
2. Enters email on `/forgot-password`
3. Supabase sends email with reset link
4. Link goes to Supabase, which redirects to `/auth/callback` with tokens
5. `/auth/callback` detects `type=recovery` and shows "Set new password" form
6. User submits new password → redirected to login with success message
