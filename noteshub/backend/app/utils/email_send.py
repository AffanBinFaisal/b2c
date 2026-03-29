import logging
from email.message import EmailMessage
from typing import Literal, Optional

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)

SendStatus = Literal["sent", "skipped", "failed"]


def _smtp_password() -> Optional[str]:
    if not settings.SMTP_PASSWORD:
        return None
    # Gmail app passwords are often shown with spaces; SMTP accepts the compact form.
    return settings.SMTP_PASSWORD.replace(" ", "")


async def send_email(
    to_address: str,
    subject: str,
    text_body: str,
    html_body: Optional[str] = None,
) -> SendStatus:
    """Send email via SMTP when configured; otherwise log only. Returns delivery status."""
    if not settings.SMTP_HOST or not settings.SMTP_FROM:
        logger.warning(
            "SMTP not configured; email not sent. To=%s Subject=%s",
            to_address,
            subject,
        )
        logger.info("--- email fallback (dev) ---\n%s\n%s", subject, text_body)
        return "skipped"

    message = EmailMessage()
    message["From"] = settings.SMTP_FROM
    message["To"] = to_address
    message["Subject"] = subject
    message.set_content(text_body)
    if html_body:
        message.add_alternative(html_body, subtype="html")

    use_ssl = settings.SMTP_USE_SSL
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=_smtp_password(),
            use_tls=use_ssl,
            start_tls=settings.SMTP_USE_TLS if not use_ssl else False,
        )
    except Exception:
        logger.exception("SMTP send failed for to=%s subject=%s", to_address, subject)
        return "failed"
    return "sent"
