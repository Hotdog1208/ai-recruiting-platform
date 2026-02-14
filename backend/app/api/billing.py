"""Billing: create Stripe Checkout Session for employers."""
import logging
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import get_settings
from app.core.deps import get_current_employer
from app.models import Employer, Plan

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/billing", tags=["billing"])


class CheckoutSessionRequest(BaseModel):
    success_url: str = "http://localhost:3000/dashboard/employer/billing?success=1"
    cancel_url: str = "http://localhost:3000/dashboard/employer/billing?cancel=1"


@router.post("/checkout-session")
def create_checkout_session(
    body: CheckoutSessionRequest | None = None,
    employer: Employer = Depends(get_current_employer),
    db: Session = Depends(get_db),
):
    """Create a Stripe Checkout Session for the current employer. Returns { url } for redirect."""
    settings = get_settings()
    if not (settings.STRIPE_SECRET_KEY or "").strip():
        raise HTTPException(status_code=501, detail="Billing not configured")

    price_id = _get_default_price_id(db)
    if not price_id:
        raise HTTPException(status_code=501, detail="No price configured for checkout")

    req = body or CheckoutSessionRequest()
    try:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        session = stripe.checkout.Session.create(
            mode="subscription",
            client_reference_id=str(employer.id),
            line_items=[{"price": price_id, "quantity": 1}],
            success_url=req.success_url,
            cancel_url=req.cancel_url,
        )
        return {"url": session.url, "session_id": session.id}
    except Exception as e:
        logger.exception("Checkout session creation failed: %s", e)
        raise HTTPException(status_code=500, detail="Failed to create checkout session")


def _get_default_price_id(db: Session) -> str | None:
    """First plan with a stripe_price_id, or None."""
    plan = db.query(Plan).filter(Plan.stripe_price_id.isnot(None)).first()
    return (plan.stripe_price_id or "").strip() or None
