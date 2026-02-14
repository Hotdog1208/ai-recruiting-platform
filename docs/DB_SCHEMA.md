# Database Schema

## Tables

### users
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Supabase auth user ID (same as Supabase auth.users.id) |
| email | VARCHAR | User email |
| role | VARCHAR | `candidate` or `employer` |
| created_at | TIMESTAMP | Created timestamp |

### candidates
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Internal candidate ID |
| user_id | UUID FK → users | Link to auth |
| full_name | VARCHAR | Display name |
| headline | VARCHAR | Short tagline |
| location, city, state, country | VARCHAR | Location (optional) |
| age | INT | Optional self-ID; **never used for matching** |
| work_preference | VARCHAR | remote, hybrid, on_site |
| work_type | VARCHAR | full_time, part_time, contract, intern |
| resume_url | VARCHAR | Supabase Storage URL |
| resume_text | TEXT | Extracted raw text |
| resume_parsed_data | JSON | Parsed profile (skills, experience, education) |
| preferences | JSONB | Job/location preferences |
| created_at, updated_at | TIMESTAMP | Timestamps |

### employers
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Internal employer ID |
| user_id | UUID FK → users | Link to auth |
| company_name | VARCHAR | Company name |
| website, domain | VARCHAR | Company web presence |
| logo_url | VARCHAR | Logo |
| verification_status | VARCHAR | pending, verified, rejected |
| verification_method | VARCHAR | email, manual |
| industry, company_size, location, description | VARCHAR | Company details |
| created_at, updated_at | TIMESTAMP | Timestamps |

### jobs
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Job ID |
| employer_id | UUID FK → employers | Owner |
| title | VARCHAR | Job title |
| description | TEXT | Full description |
| requirements | JSON | Requirements list |
| skills | JSONB | Required skills |
| location | VARCHAR | Location |
| remote | BOOLEAN | Remote allowed |
| employment_type | VARCHAR | full_time, part_time, contract, intern |
| salary_min, salary_max | INT | Salary range |
| status | VARCHAR | open, closed |
| created_at, updated_at | TIMESTAMP | Timestamps |

### applications
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Application ID |
| job_id | UUID FK → jobs | Job applied to |
| candidate_id | UUID FK → candidates | Applicant |
| status | VARCHAR | pending, reviewed, accepted, rejected |
| cover_letter | TEXT | Cover letter |
| created_at, updated_at | TIMESTAMP | Timestamps |

### saved_jobs
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Saved job ID |
| candidate_id | UUID FK → candidates | Saver |
| job_id | UUID FK → jobs | Job saved |
| created_at | TIMESTAMP | Saved timestamp |

### matches
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Match ID |
| job_id | UUID FK → jobs | Job |
| candidate_id | UUID FK → candidates | Candidate |
| score | INT | 0–100 match score |
| explanation | JSONB | Bullets, gaps (**never includes protected attributes**) |
| created_at, updated_at | TIMESTAMP | Timestamps |
| UNIQUE(job_id, candidate_id) | | One match per pair |

### employer_notes
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Note ID |
| application_id | UUID FK → applications | Application |
| employer_id | UUID FK → employers | Note author |
| note | TEXT | Note content |
| created_at | TIMESTAMP | Timestamp |

### plans
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Plan ID |
| name | VARCHAR | free, starter, pro |
| stripe_price_id | VARCHAR | Stripe price ID |
| limits | JSONB | active_jobs, applicants_view, ai_explanations |

### subscriptions
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Subscription ID |
| employer_id | UUID FK → employers | Employer |
| stripe_customer_id | VARCHAR | Stripe customer |
| stripe_subscription_id | VARCHAR | Stripe subscription |
| status | VARCHAR | active, canceled, past_due |
| current_period_end | TIMESTAMP | Period end |
| plan_id | UUID FK → plans | Current plan |
| created_at, updated_at | TIMESTAMP | Timestamps |

### usage_counters
| Column | Type | Purpose |
|--------|------|---------|
| id | UUID PK | Counter ID |
| employer_id | UUID FK → employers | Employer |
| month | VARCHAR | YYYY-MM |
| jobs_posted_count | INT | Jobs posted this month |
| applicants_viewed_count | INT | Applicants viewed this month |
| UNIQUE(employer_id, month) | | One row per employer per month |

## Indexes

- `applications(job_id)`, `applications(candidate_id)`
- `jobs(employer_id, status, created_at)`
- `matches(job_id, score)`, `matches(candidate_id, score)`
- `saved_jobs(candidate_id)`
