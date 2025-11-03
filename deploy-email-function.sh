#!/bin/bash

# Deploy Email Queue Processing Function
# This script deploys the process-email-queue edge function to Supabase

echo "🚀 Deploying process-email-queue edge function..."

# Check if user is logged in
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Not logged in to Supabase CLI"
    echo "Please run: supabase login"
    exit 1
fi

# Deploy the function
supabase functions deploy process-email-queue --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ Edge function deployed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Set RESEND_API_KEY in Supabase Dashboard → Project Settings → Edge Functions → Secrets"
    echo "2. Test the function: supabase functions invoke process-email-queue"
    echo "3. Set up a cron job to process emails automatically (see EMAIL_NOTIFICATIONS_SETUP.md)"
else
    echo "❌ Deployment failed"
    echo "Check your Supabase CLI configuration and try again"
    exit 1
fi

