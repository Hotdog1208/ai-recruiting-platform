# Final Testing Protocol

Use this checklist after layout fixes and backend bulletproofing (see PLAN / critical fixes protocol).

## 1. Layout tests

- [ ] **Hero** – Title and subtitle don’t overflow; text readable on mobile and desktop
- [ ] **Navigation** – All links visible and clickable; navbar stays above content (z-index)
- [ ] **Search bar** – Aligned and functional on home and jobs page; focus styles visible
- [ ] **Stats section** – Numbers and labels aligned (AI / 0% / 1-Click / ∞)
- [ ] **Cards grid** – “How it works” and feature cards: equal heights, proper spacing
- [ ] **Pricing cards** – (if present) Buttons at bottom; consistent card heights
- [ ] **Footer** – All sections visible; links work
- [ ] **Mobile (375px)** – Everything readable; no horizontal scroll; buttons tappable
- [ ] **Tablet (768px)** – Layout transitions smoothly; no overlapping
- [ ] **Desktop (1920px)** – No excessive stretching; comfortable line length

## 2. Backend tests

- [ ] **Database/API** – Backend health OK; frontend can reach API
- [ ] **Supabase auth** – Connection check (e.g. `testSupabaseConnection`) or login works
- [ ] **User signup** – Candidate and employer signup complete without error
- [ ] **User login** – Login and redirect to correct dashboard
- [ ] **Job listing** – Jobs page loads; list and search work
- [ ] **Job search/filters** – Filters (e.g. location, type) apply correctly
- [ ] **Resume upload** – Upload succeeds; validation (size/type) when implemented
- [ ] **Application submission** – Apply to job creates application; visible in dashboard
- [ ] **User dashboard** – Candidate and employer dashboards load with data
- [ ] **Errors** – API/network errors show clear message; no white screen
- [ ] **Loading states** – Loading indicators show during async operations
- [ ] **Auth persist** – Refresh keeps user logged in (session persists)

## 3. Performance tests

- [ ] **Page load** – Initial load under ~3 seconds on typical connection
- [ ] **Console** – No uncaught errors in browser console
- [ ] **API latency** – Key API calls complete within ~2 seconds
- [ ] **Images** – Lazy load where applicable; no layout shift
- [ ] **Animations** – Smooth (target 60fps); reduced motion respected
- [ ] **Mobile** – Acceptable performance on mid-range device

## Optional

- Run **Lighthouse** (Performance, Accessibility, Best Practices) and address critical issues
- Deploy to staging and re-run layout + backend checklists
