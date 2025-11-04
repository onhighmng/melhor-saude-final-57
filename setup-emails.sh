#!/bin/bash

# Email Setup Script
# This script will deploy all email functions and guide you through configuration

set -e

echo "📧 Email System Setup"
echo "===================="
echo ""

# Check if logged in
echo "1️⃣ Checking Supabase CLI login..."
if ! supabase projects list > /dev/null 2>&1; then
    echo "❌ Not logged in to Supabase CLI"
    echo ""
    echo "Please run: supabase login"
    echo "Then run this script again."
    exit 1
fi
echo "✅ Logged in"
echo ""

# Deploy email functions
echo "2️⃣ Deploying email functions..."
echo ""

echo "Deploying process-email-queue..."
supabase functions deploy process-email-queue --no-verify-jwt
echo ""

echo "Deploying send-email..."
supabase functions deploy send-email --no-verify-jwt
echo ""

echo "Deploying send-booking-email..."
supabase functions deploy send-booking-email --no-verify-jwt
echo ""

echo "✅ All email functions deployed!"
echo ""

# Instructions for API key
echo "3️⃣ Next Steps - IMPORTANT"
echo "========================="
echo ""
echo "You need to add your Resend API key:"
echo ""
echo "1. Go to: https://resend.com/api-keys"
echo "2. Copy your API key (starts with 're_')"
echo "3. Go to your Supabase Dashboard:"
echo "   https://supabase.com/dashboard"
echo "4. Navigate to: Edge Functions → Manage secrets"
echo "5. Add new secret:"
echo "   - Name: RESEND_API_KEY"
echo "   - Value: [paste your Resend API key]"
echo ""

read -p "Press ENTER when you've added the RESEND_API_KEY..."

# Test the setup
echo ""
echo "4️⃣ Testing email system..."
echo ""

echo "Checking if emails can be processed..."
supabase functions invoke process-email-queue

echo ""
echo "✅ Email system is ready!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 What's Working Now:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Email infrastructure deployed"
echo "✅ Functions ready to send emails"
echo "✅ Queue system active"
echo ""
echo "📧 Test It:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Go to Admin → Company Detail page"
echo "2. Add an employee with YOUR email"
echo "3. Click 'Gerar Códigos'"
echo "4. Click 'Enviar Emails'"
echo "5. Check your inbox and Resend dashboard!"
echo ""
echo "🔧 Monitor:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "- Email queue: SELECT * FROM email_queue;"
echo "- Resend dashboard: https://resend.com/emails"
echo "- Function logs: supabase functions logs send-email --tail"
echo ""
echo "📚 Documentation:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "- test-email-setup.md - Testing guide"
echo "- EMAIL_SYSTEM_SUMMARY.md - Full overview"
echo "- QUICK_START_EMAILS.md - Quick reference"
echo ""
echo "🎉 Done! Your email system is ready to use."
echo ""

