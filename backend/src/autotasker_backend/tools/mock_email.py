"""MockEmailTool — pretends to send an email and logs the payload.

Useful for end-to-end testing of the Worker pipeline without wiring an
SMTP / Resend / Postmark account. Replace with a real provider in the
production tool set.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, EmailStr, Field

from ..core.logging import get_logger
from .registry import REGISTRY, ToolSpec

log = get_logger(__name__)


class MockEmailInput(BaseModel):
    to: EmailStr = Field(..., description="Recipient email address.")
    subject: str = Field(..., min_length=1, max_length=200)
    body: str = Field(..., min_length=1, max_length=10_000)


async def _handler(raw_inputs: dict[str, Any]) -> dict[str, Any]:
    inputs = MockEmailInput.model_validate(raw_inputs)
    log.info(
        "mock_email.send",
        to=inputs.to,
        subject=inputs.subject,
        body_len=len(inputs.body),
    )
    return {
        "delivered": True,
        "to": inputs.to,
        "subject": inputs.subject,
        "delivered_at": datetime.now(UTC).isoformat(),
        "provider": "mock",
    }


MOCK_EMAIL_TOOL = REGISTRY.register(
    ToolSpec(
        id="mock_email",
        name="Mock Email Sender",
        description=(
            "Pretends to send an email — logs the payload to the backend instead of "
            "actually delivering it. Use this in development to exercise the full "
            "Worker pipeline without provisioning an email provider."
        ),
        input_schema=MockEmailInput,
        handler=_handler,
        requires_oauth=False,
        tags=("email", "write", "mock"),
    )
)
