# Password Reset Setup Guide

## Overview

This application uses a custom password reset flow without email for @tcs.com users:

1. User verifies identity with email + birth year
2. User sets new password directly on the page
3. Password is updated via Supabase Edge Function
4. User is redirected to login

## Required Setup Steps

### 1. Run Database Migration

Execute the SQL migration to add password reset tracking:

```bash
# Apply the migration file
supabase db push supabase-migrations/10-create-password-reset-function.sql
```

Or manually run the SQL in your Supabase SQL Editor:

```sql
-- Content from: supabase-migrations/10-create-password-reset-function.sql
```

### 2. Deploy Supabase Edge Function

Deploy the reset-password Edge Function:

```bash
# Login to Supabase CLI
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy reset-password

# Set required secrets (if not already set)
supabase secrets set SUPABASE_URL=your-supabase-url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The Edge Function file is located at: `supabase-functions/reset-password/index.ts`

### 3. Update Environment Variables

Make sure your `.env` file has:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Locally

```bash
# Start dev server
npm run dev

# Test password reset flow:
# 1. Go to /forgot-password
# 2. Enter email + birth year
# 3. Set new password
# 4. Login with new password
```

## Docker Deployment to AWS

### Build and Test Locally

```bash
# Build Docker image
docker build -t ai-demo .

# Test locally
docker run -p 8080:80 ai-demo

# Open http://localhost:8080
```

### Deploy to AWS ECR

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Create ECR repository (first time only)
aws ecr create-repository --repository-name ai-demo --region us-east-1

# Tag image
docker tag ai-demo:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-demo:latest

# Push to ECR
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/ai-demo:latest
```

### Deploy to AWS App Runner

1. Go to AWS App Runner Console
2. Create new service
3. Source: Container registry → Amazon ECR
4. Select your ECR image
5. Configure:
   - **Port**: 80
   - **Environment variables**: Add your Supabase credentials
   - **Health check**: /health
6. Deploy

## Architecture

```
User submits password reset
         ↓
Verify birth year (marks reset_verified_at in DB)
         ↓
User enters new password
         ↓
Frontend calls Edge Function
         ↓
Edge Function verifies reset_verified_at (within 10 min)
         ↓
Edge Function updates password using Admin API
         ↓
User redirected to login
```

## Security Notes

- Password reset verification expires after 10 minutes
- Edge Function uses Supabase Admin API (service role key)
- Service role key is never exposed to client
- HomePage is public (shown before login) at `/` route

## Troubleshooting

**Error: "Password reset function not available"**

- Ensure Edge Function is deployed: `supabase functions list`
- Check function logs: `supabase functions logs reset-password`

**Error: "Password reset verification expired"**

- User has 10 minutes from birth year verification to reset password
- Ask them to start over from step 1

**Error: "User not found"**

- Ensure user exists in auth.users table
- Check user_profiles table has correct email
