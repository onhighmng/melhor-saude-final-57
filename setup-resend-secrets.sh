#!/bin/bash
# Setup Resend API Key for Email Sending
# Run: ./setup-resend-secrets.sh

set -e

echo "🔐 Setting up Resend API Key for Supabase Edge Functions"
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null && ! command -v npx &> /dev/null; then
    echo "❌ Error: Neither 'supabase' nor 'npx' found."
    echo "Please install Supabase CLI: npm install -g supabase"
    exit 1
fi

# Prompt for Resend API Key
echo "📧 Get your Resend API key from: https://resend.com/api-keys"
echo ""
read -p "Enter your Resend API key (starts with 're_'): " RESEND_KEY

if [ -z "$RESEND_KEY" ]; then
    echo "❌ Error: API key cannot be empty"
    exit 1
fi

if [[ ! "$RESEND_KEY" =~ ^re_ ]]; then
    echo "⚠️  Warning: API key should start with 're_'"
    read -p "Continue anyway? (y/n): " CONFIRM
    if [ "$CONFIRM" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🔄 Setting RESEND_API_KEY secret..."

# Try with supabase CLI first, fallback to npx
if command -v supabase &> /dev/null; then
    supabase secrets set RESEND_API_KEY="$RESEND_KEY"
else
    npx supabase secrets set RESEND_API_KEY="$RESEND_KEY"
fi

echo ""
echo "✅ RESEND_API_KEY has been set!"
echo ""

# Generate webhook secret for auth emails
echo "🔐 Generating webhook secret for password reset emails..."
WEBHOOK_SECRET=$(openssl rand -base64 32)

if command -v supabase &> /dev/null; then
    supabase secrets set SEND_AUTH_EMAIL_HOOK_SECRET="$WEBHOOK_SECRET"
else
    npx supabase secrets set SEND_AUTH_EMAIL_HOOK_SECRET="$WEBHOOK_SECRET"
fi

echo ""
echo "✅ SEND_AUTH_EMAIL_HOOK_SECRET has been set!"
echo ""
echo "📋 Webhook Secret (save this for Auth Hook configuration):"
echo "$WEBHOOK_SECRET"
echo ""

# Verify secrets
echo "🔍 Verifying secrets are set..."
if command -v supabase &> /dev/null; then
    supabase secrets list
else
    npx supabase secrets list
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📧 Next steps:"
echo "1. Process pending emails: npx supabase functions invoke process-email-queue"
echo "2. Configure Auth Hook in Supabase Dashboard:"
echo "   - Go to: https://supabase.com/dashboard/project/ygxamuymjjpqhjoegweb/auth/hooks"
echo "   - Enable 'Send Email' hook"
echo "   - URL: https://ygxamuymjjpqhjoegweb.supabase.co/functions/v1/send-auth-email"
echo "   - Secret: $WEBHOOK_SECRET"
echo "3. Test by sending an email (add employee, create booking, etc.)"
echo ""
echo "For troubleshooting, see: EMAIL_ISSUE_DIAGNOSTIC_AND_FIX.md"

