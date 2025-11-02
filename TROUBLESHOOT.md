# Troubleshooting Local Setup

Please run these commands in your terminal and share the output:

## 1. Check Node.js and npm
```bash
node --version
npm --version
```

## 2. Check if you're in the right directory
```bash
pwd
ls -la package.json
```

## 3. Try to start the dev server
```bash
cd /Users/anapaula/Documents/GitHub/melhor-saude-final-57
npm run dev
```

## 4. If it fails, check for port conflicts
```bash
lsof -ti:5173
```

## 5. If port 5173 is busy, kill it
```bash
kill -9 $(lsof -ti:5173)
```

## Common Issues:

### Issue 1: "command not found: npm"
**Solution:** Install Node.js from https://nodejs.org/

### Issue 2: "dependencies not installed"
**Solution:** Run `npm install` first

### Issue 3: "Port 5173 is already in use"
**Solution:** Kill the process with `kill -9 $(lsof -ti:5173)`

### Issue 4: Missing .env file
**Solution:** You need Supabase credentials. Create `.env.local`:
```
VITE_SUPABASE_URL=https://ygxamuymjjpqhjoegweb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## What error are you seeing?
Please copy and paste the exact error message.

