from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    UserUpdate,
    PasswordChange,
    Token,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
    RecoverAccountRequest,
)
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user
from app.config import settings
from app.utils.tokens import generate_raw_token, hash_token
from app.utils.email_send import send_email
from app.utils.email_templates import render_transactional_email_html

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _normalize_email(email: str) -> str:
    return email.strip().lower()


def _user_response(user: dict) -> dict:
    ev = user.get("emailVerified")
    if ev is None:
        ev = True
    return {
        "_id": str(user["_id"]),
        "email": user["email"],
        "name": user["name"],
        "createdAt": user["createdAt"],
        "lastLoginAt": user.get("lastLoginAt"),
        "preferences": user.get("preferences", {"searchLogic": "AND"}),
        "emailVerified": bool(ev),
    }


async def _send_verification_email(db, user: dict, raw_token: str):
    link = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={raw_token}"
    subject = "Verify your NotesHub email"
    text = (
        f"Hi {user['name']},\n\n"
        "Thanks for signing up for NotesHub. Verify your email by opening this link in your browser:\n"
        f"{link}\n\n"
        "If you did not create an account, you can ignore this message.\n"
    )
    html = render_transactional_email_html(
        greeting_name=user["name"],
        headline="Verify your email",
        intro="Thanks for signing up for NotesHub. Click the button below to confirm your address and start using your account.",
        cta_url=link,
        cta_label="Verify email address",
        footnote="If you did not create a NotesHub account, you can safely ignore this message.",
    )
    return await send_email(user["email"], subject, text, html)


async def _send_password_reset_email(db, user: dict, raw_token: str):
    link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={raw_token}"
    subject = "Reset your NotesHub password"
    text = (
        f"Hi {user['name']},\n\n"
        "We received a request to reset your NotesHub password. Open this link (valid for 1 hour):\n"
        f"{link}\n\n"
        "If you did not request a reset, you can ignore this email.\n"
    )
    html = render_transactional_email_html(
        greeting_name=user["name"],
        headline="Reset your password",
        intro="We received a request to reset your password. Use the button below to choose a new password. This link expires in one hour.",
        cta_url=link,
        cta_label="Choose a new password",
        footnote="If you did not request a password reset, you can ignore this email. Your password will stay the same.",
    )
    return await send_email(user["email"], subject, text, html)


async def _store_auth_token(db, token_type: str, user_id: ObjectId, raw_token: str, ttl: timedelta) -> None:
    await db.auth_tokens.insert_one(
        {
            "type": token_type,
            "userId": user_id,
            "tokenHash": hash_token(raw_token),
            "expiresAt": datetime.utcnow() + ttl,
            "createdAt": datetime.utcnow(),
        }
    )


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user (email verification required before login)."""
    db = get_database()
    email = _normalize_email(user_data.email)

    existing_user = await db.users.find_one({"email": email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    verified = bool(settings.AUTO_VERIFY_EMAIL)
    user_dict = {
        "email": email,
        "passwordHash": get_password_hash(user_data.password),
        "name": user_data.name,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "lastLoginAt": None,
        "preferences": {"searchLogic": "AND"},
        "deletedAt": None,
        "emailVerified": verified,
    }

    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id

    if verified:
        return {
            "message": "Account created. You can sign in now.",
            "email": email,
        }

    raw = generate_raw_token()
    await _store_auth_token(db, "email_verify", result.inserted_id, raw, timedelta(hours=48))
    send_status = await _send_verification_email(db, user_dict, raw)

    out = {
        "message": "Account created. Check your email to verify before signing in.",
        "email": email,
    }
    if settings.ENVIRONMENT == "development" and send_status != "sent":
        out["verificationLink"] = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={raw}"
    return out


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return access token"""
    db = get_database()
    email = _normalize_email(user_data.email)

    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.get("deletedAt"):
        cutoff = datetime.utcnow() - timedelta(days=settings.SOFT_DELETE_RETENTION_DAYS)
        if user["deletedAt"] > cutoff:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is scheduled for deletion. Use recover account or contact support.",
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.get("emailVerified") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Check your inbox or resend verification.",
        )

    if not verify_password(user_data.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLoginAt": datetime.utcnow()}},
    )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires,
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/recover", response_model=Token)
async def recover_account(body: RecoverAccountRequest):
    """Restore a soft-deleted account within the retention window."""
    db = get_database()
    email = _normalize_email(body.email)

    user = await db.users.find_one({"email": email})
    if not user or not user.get("deletedAt"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No recoverable account found for this email.",
        )

    cutoff = datetime.utcnow() - timedelta(days=settings.SOFT_DELETE_RETENTION_DAYS)
    if user["deletedAt"] <= cutoff:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Recovery period has expired.",
        )

    if not verify_password(body.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
        )

    if user.get("emailVerified") is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Verify your email first.",
        )

    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"deletedAt": None, "updatedAt": datetime.utcnow()}},
    )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires,
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest):
    """Send password reset email if the account exists."""
    db = get_database()
    email = _normalize_email(body.email)
    user = await db.users.find_one({"email": email, "deletedAt": None})
    if user:
        await db.auth_tokens.delete_many({"userId": user["_id"], "type": "password_reset"})
        raw = generate_raw_token()
        await _store_auth_token(db, "password_reset", user["_id"], raw, timedelta(hours=1))
        await _send_password_reset_email(db, user, raw)
    return {"message": "If an account exists for that email, password reset instructions were sent."}


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest):
    """Set a new password using a token from email."""
    db = get_database()
    th = hash_token(body.token)
    doc = await db.auth_tokens.find_one(
        {"tokenHash": th, "type": "password_reset", "expiresAt": {"$gt": datetime.utcnow()}}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    await db.users.update_one(
        {"_id": doc["userId"]},
        {"$set": {"passwordHash": get_password_hash(body.newPassword), "updatedAt": datetime.utcnow()}},
    )
    await db.auth_tokens.delete_one({"_id": doc["_id"]})
    return {"message": "Password updated. You can sign in now."}


@router.post("/verify-email")
async def verify_email(body: VerifyEmailRequest):
    """Mark email as verified using token from registration email."""
    db = get_database()
    th = hash_token(body.token)
    doc = await db.auth_tokens.find_one(
        {"tokenHash": th, "type": "email_verify", "expiresAt": {"$gt": datetime.utcnow()}}
    )
    if not doc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

    await db.users.update_one(
        {"_id": doc["userId"]},
        {"$set": {"emailVerified": True, "updatedAt": datetime.utcnow()}},
    )
    await db.auth_tokens.delete_one({"_id": doc["_id"]})
    return {"message": "Email verified. You can sign in now."}


@router.post("/resend-verification")
async def resend_verification(body: ResendVerificationRequest):
    """Resend verification email."""
    db = get_database()
    email = _normalize_email(body.email)
    user = await db.users.find_one({"email": email, "deletedAt": None})
    if user and user.get("emailVerified") is False:
        await db.auth_tokens.delete_many({"userId": user["_id"], "type": "email_verify"})
        raw = generate_raw_token()
        await _store_auth_token(db, "email_verify", user["_id"], raw, timedelta(hours=48))
        await _send_verification_email(db, user, raw)
    return {"message": "If an account exists for that email, a verification link was sent."}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return _user_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
):
    """Update current user profile"""
    db = get_database()

    update_data = {}
    if user_update.name is not None:
        update_data["name"] = user_update.name
    if user_update.preferences is not None:
        update_data["preferences"] = user_update.preferences

    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data},
        )

    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    return _user_response(updated_user)


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user),
):
    """Change user password"""
    db = get_database()

    if not verify_password(password_data.currentPassword, current_user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "passwordHash": get_password_hash(password_data.newPassword),
                "updatedAt": datetime.utcnow(),
            }
        },
    )

    return {"message": "Password changed successfully"}


@router.post("/logout")
async def logout():
    """Client should discard JWT; included for PRD logout operation (stateless tokens are not revoked server-side)."""
    return {"message": "Logged out"}


@router.delete("/me")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Soft delete user account (30-day recovery period)"""
    db = get_database()

    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "deletedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
            }
        },
    )

    return {"message": "Account deleted successfully. You have 30 days to recover your account."}
