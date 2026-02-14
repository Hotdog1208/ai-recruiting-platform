"""Stripe webhook handler. Verify signature and process subscription events."""
import logging
from fastapi import APIRouter, Request, HTTPException, Header, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _get_stripe_webhook_secret() -> str | None:
    try:
        s = get_settings()
        return (s.STRIPE_WEBHOOK_SECRET or "").strip() or None
    except Exception:
        return None


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(None, alias="Stripe-Signature"),
    db: Session = Depends(get_db),
):
    """Handle Stripe webhook events. Verify signature; process subscription lifecycle."""
    secret = _get_stripe_webhook_secret()
    if not secret:
        logger.warning("Stripe webhook received but STRIPE_WEBHOOK_SECRET not set")
        raise HTTPException(status_code=500, detail="Webhook not configured")

    try:
        payload = await request.body()
    except Exception as e:
        logger.warning("Stripe webhook body read failed: %s", e)
        raise HTTPException(status_code=400, detail="Invalid body")

    try:
        import stripe
        event = stripe.Webhook.construct_event(payload, stripe_signature or "", secret)
    except ValueError as e:
        logger.warning("Stripe webhook invalid payload: %s", e)
        raise HTTPException(status_code=400, detail="Invalid payload")
    except Exception as e:
        logger.warning("Stripe webhook signature verification failed: %s", type(e).__name__)
        raise HTTPException(status_code=400, detail="Invalid signature")

    # Process known events
    if event.type == "checkout.session.completed":
        _handle_checkout_completed(db, event.data.object)
    elif event.type == "customer.subscription.updated":
        _handle_subscription_updated(db, event.data.object)
    elif event.type == "customer.subscription.deleted":
        _handle_subscription_deleted(db, event.data.object)

    return {"received": True}


def _handle_checkout_completed(db: Session, session: dict) -> None:
    """Create or update subscription record from checkout.session.completed."""
    from app.models import Subscription, Employer

    client_ref = (session.get("client_reference_id") or "").strip()
    if not client_ref:
        return
    sub_id = session.get("subscription")
    customer_id = session.get("customer")
    if not sub_id or not customer_id:
        return
    try:
        employer = db.query(Employer).filter(Employer.id == client_ref).first()
        if not employer:
            return
        existing = db.query(Subscription).filter(
            Subscription.employer_id == employer.id
        ).first()
        if existing:
            existing.stripe_customer_id = customer_id
            existing.stripe_subscription_id = sub_id
            existing.status = "active"
        else:
            sub = Subscription(
                employer_id=employer.id,
                stripe_customer_id=customer_id,
                stripe_subscription_id=sub_id,
                status="active",
            )
            db.add(sub)
        db.commit()
    except Exception as e:
        logger.exception("checkout.session.completed handler failed: %s", e)
        db.rollback()


def _handle_subscription_updated(db: Session, subscription: dict) -> None:
    """Update subscription status and period from customer.subscription.updated."""
    from app.models import Subscription
    from datetime import datetime

    sub_id = subscription.get("id")
    status = subscription.get("status")
    period_end = subscription.get("current_period_end")
    if not sub_id:
        return
    try:
        rec = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == sub_id
        ).first()
        if not rec:
            return
        rec.status = status or rec.status
        if period_end:
            rec.current_period_end = datetime.utcfromtimestamp(period_end)
        db.commit()
    except Exception as e:
        logger.exception("customer.subscription.updated handler failed: %s", e)
        db.rollback()


def _handle_subscription_deleted(db: Session, subscription: dict) -> None:
    """Mark subscription as canceled."""
    from app.models import Subscription

    sub_id = subscription.get("id")
    if not sub_id:
        return
    try:
        rec = db.query(Subscription).filter(
            Subscription.stripe_subscription_id == sub_id
        ).first()
        if rec:
            rec.status = "canceled"
            rec.stripe_subscription_id = None
            db.commit()
    except Exception as e:
        logger.exception("customer.subscription.deleted handler failed: %s", e)
        db.rollback()
