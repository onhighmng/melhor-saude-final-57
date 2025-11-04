# Navbar Visual Guide - Role-Specific Dropdowns

## Overview
This document provides a visual representation of what each user sees in the navbar based on their role.

---

## 🔷 Admin User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [Admin ▼]     👤 Olá, Admin  [Sair]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

When clicking [Admin ▼]:
├─ Dashboard
├─ Prestadores
└─ Utilizadores
```

---

## 🏢 HR (RH) User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [RH ▼]        👤 Olá, Maria  [Sair]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

When clicking [RH ▼]:
├─ Dashboard
├─ Colaboradores
└─ Relatórios
```

---

## 🏥 Prestador User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [Prestador ▼]  👤 Olá, João  [Sair]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

When clicking [Prestador ▼]:
├─ Dashboard
├─ Calendário
└─ Sessões
```

---

## 👨‍⚕️ Especialista User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [Especialista ▼]  👤 Olá, Dr. Silva  [Sair]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

When clicking [Especialista ▼]:
├─ Dashboard
├─ Sessões
└─ Pacientes
```

---

## 👤 Regular User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [Minha Saúde ▼]  👤 Olá, Ana  [Sair]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

When clicking [Minha Saúde ▼]:
├─ Dashboard
├─ Agendar Sessão
└─ Meu Percurso
```

---

## 🚫 Unauthenticated User Navbar

```
┌─────────────────────────────────────────────────────────────────────┐
│  Logo    [Sobre Nós]  [4 Pilares ▼]  [Agendamento]  [Minha Saúde]  [Entrar]  [Registar]  │
└─────────────────────────────────────────────────────────────────────┘

When clicking [4 Pilares ▼]:
├─ Saúde Mental
├─ Bem-estar Físico
├─ Assistência Financeira
└─ Assistência Jurídica

Note: Clicking [Agendamento] or [Minha Saúde] will redirect to login
```

---

## 📱 Mobile View

All roles have the same structure in mobile view:

```
┌─────────────────────────┐
│  Logo           ☰ Menu  │
└─────────────────────────┘

When clicking ☰:
┌─────────────────────────┐
│  ✕                      │
│                         │
│  Sobre Nós              │
│  4 Pilares ▼            │
│    └─ (expands)         │
│  [Role Dropdown] ▼      │
│    └─ (expands)         │
│                         │
│  [Role-specific pages]  │
│                         │
│  [Entrar] or [Sair]     │
│  [Registar]             │
└─────────────────────────┘
```

---

## Key Visual Elements

### Dropdown Indicators
- **▼** - Indicates a clickable dropdown menu
- Rotates to **▲** when opened

### User Greeting
- **👤 Olá, [Name]** - Shows the logged-in user's name

### Buttons
- **[Sobre Nós]** - Solid button, no dropdown
- **[4 Pilares ▼]** - Dropdown with 4 options
- **[Role ▼]** - Role-specific dropdown
- **[Sair]** - Logout button (authenticated users)
- **[Entrar]** - Login button (unauthenticated)
- **[Registar]** - Register button (unauthenticated)

---

## Interaction Behavior

1. **Hover Effects**
   - Buttons change color on hover
   - Smooth transition animations

2. **Click Behavior**
   - Dropdowns open on click
   - Click outside to close
   - Clicking an item closes the dropdown and navigates

3. **Visual Feedback**
   - Active dropdown shows rotated chevron
   - Dropdown items highlight on hover
   - Smooth animations for open/close

---

## Accessibility

- All dropdowns have proper ARIA attributes
- Keyboard navigation supported
- Screen reader friendly
- Focus management implemented

---

## Testing Checklist

- [ ] Admin sees Admin dropdown
- [ ] HR sees RH dropdown
- [ ] Prestador sees Prestador dropdown
- [ ] Especialista sees Especialista dropdown
- [ ] Regular user sees Minha Saúde dropdown
- [ ] All users see Sobre Nós and 4 Pilares
- [ ] Dropdowns open/close correctly
- [ ] Navigation works from all dropdown items
- [ ] Mobile menu works for all roles
- [ ] Unauthenticated users see default menu




