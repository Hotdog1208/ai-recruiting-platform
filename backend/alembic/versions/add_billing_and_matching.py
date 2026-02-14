"""add billing, matching, employer notes, schema updates

Revision ID: add_billing_match
Revises: add_employer_profile
Create Date: 2026-02-08

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "add_billing_match"
down_revision: Union[str, Sequence[str], None] = "add_employer_profile"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Employers: domain, logo_url, verification_status, verification_method, created_at, updated_at
    op.add_column("employers", sa.Column("domain", sa.String(), nullable=True))
    op.add_column("employers", sa.Column("logo_url", sa.String(), nullable=True))
    op.add_column("employers", sa.Column("verification_status", sa.String(), nullable=True))
    op.add_column("employers", sa.Column("verification_method", sa.String(), nullable=True))
    op.add_column("employers", sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))
    op.add_column("employers", sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))

    # Jobs: employment_type, salary_min, salary_max, skills, status, created_at, updated_at
    op.add_column("jobs", sa.Column("employment_type", sa.String(), nullable=True))
    op.add_column("jobs", sa.Column("salary_min", sa.Integer(), nullable=True))
    op.add_column("jobs", sa.Column("salary_max", sa.Integer(), nullable=True))
    op.add_column("jobs", sa.Column("skills", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("jobs", sa.Column("status", sa.String(), server_default="open", nullable=True))
    op.add_column("jobs", sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))
    op.add_column("jobs", sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))

    # Applications: cover_letter, updated_at
    op.add_column("applications", sa.Column("cover_letter", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))

    # Candidates: resume_text, preferences, created_at, updated_at
    op.add_column("candidates", sa.Column("resume_text", sa.Text(), nullable=True))
    op.add_column("candidates", sa.Column("preferences", postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    op.add_column("candidates", sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))
    op.add_column("candidates", sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True))

    # Matches table
    op.create_table(
        "matches",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("job_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("explanation", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["candidate_id"], ["candidates.id"]),
        sa.ForeignKeyConstraint(["job_id"], ["jobs.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("job_id", "candidate_id", name="uq_match_job_candidate"),
    )
    op.create_index("ix_matches_job_score", "matches", ["job_id", "score"])
    op.create_index("ix_matches_candidate_score", "matches", ["candidate_id", "score"])

    # Employer notes
    op.create_table(
        "employer_notes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("application_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("note", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["application_id"], ["applications.id"]),
        sa.ForeignKeyConstraint(["employer_id"], ["employers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Plans
    op.create_table(
        "plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("stripe_price_id", sa.String(), nullable=True),
        sa.Column("limits", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    # Subscriptions
    op.create_table(
        "subscriptions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("stripe_customer_id", sa.String(), nullable=True),
        sa.Column("stripe_subscription_id", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=True),
        sa.Column("current_period_end", sa.DateTime(), nullable=True),
        sa.Column("plan_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("now()"), nullable=True),
        sa.ForeignKeyConstraint(["employer_id"], ["employers.id"]),
        sa.ForeignKeyConstraint(["plan_id"], ["plans.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Usage counters
    op.create_table(
        "usage_counters",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("employer_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("month", sa.String(), nullable=False),
        sa.Column("jobs_posted_count", sa.Integer(), server_default=sa.text("0"), nullable=True),
        sa.Column("applicants_viewed_count", sa.Integer(), server_default=sa.text("0"), nullable=True),
        sa.ForeignKeyConstraint(["employer_id"], ["employers.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_usage_employer_month", "usage_counters", ["employer_id", "month"], unique=True)

    # Indexes for applications, jobs
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_candidate_id", "applications", ["candidate_id"])
    op.create_index("ix_jobs_employer_status_created", "jobs", ["employer_id", "status", "created_at"])
    op.create_index("ix_saved_jobs_candidate_id", "saved_jobs", ["candidate_id"])


def downgrade() -> None:
    op.drop_index("ix_saved_jobs_candidate_id", "saved_jobs")
    op.drop_index("ix_jobs_employer_status_created", "jobs")
    op.drop_index("ix_applications_candidate_id", "applications")
    op.drop_index("ix_applications_job_id", "applications")
    op.drop_index("ix_usage_employer_month", "usage_counters")
    op.drop_table("usage_counters")
    op.drop_table("subscriptions")
    op.drop_table("plans")
    op.drop_index("ix_matches_candidate_score", "matches")
    op.drop_index("ix_matches_job_score", "matches")
    op.drop_table("matches")
    op.drop_table("employer_notes")
    op.drop_column("candidates", "updated_at")
    op.drop_column("candidates", "created_at")
    op.drop_column("candidates", "preferences")
    op.drop_column("candidates", "resume_text")
    op.drop_column("applications", "updated_at")
    op.drop_column("applications", "cover_letter")
    op.drop_column("jobs", "updated_at")
    op.drop_column("jobs", "created_at")
    op.drop_column("jobs", "status")
    op.drop_column("jobs", "skills")
    op.drop_column("jobs", "salary_max")
    op.drop_column("jobs", "salary_min")
    op.drop_column("jobs", "employment_type")
    op.drop_column("employers", "updated_at")
    op.drop_column("employers", "created_at")
    op.drop_column("employers", "verification_method")
    op.drop_column("employers", "verification_status")
    op.drop_column("employers", "logo_url")
    op.drop_column("employers", "domain")
