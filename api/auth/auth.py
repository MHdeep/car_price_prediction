from settings import secret
import jwt
from datetime import datetime, timezone, timedelta
from database.base import get_db, User
from sqlalchemy.orm import Session
from fastapi import Cookie, status, HTTPException, Depends
from redis.asyncio import Redis

SECRET = secret()


def generate_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=168)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire},
        SECRET,
        algorithm="HS256"
    )


def verify_token(
    access_token: str = Cookie(default=None),
    db: Session = Depends(get_db)
):
    """Verify JWT token and return user (without blacklist check)."""
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن ارائه نشده است"
        )

    try:
        decoded = jwt.decode(access_token, SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن منقضی شده است"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="توکن نامعتبر است"
        )

    user_id = decoded.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="پیلود توکن نامعتبر است"
        )

    try:
        user_id_int = int(user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="شناسه کاربری نامعتبر است"
        )

    user = db.query(User).filter(User.id == user_id_int).one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="کاربر یافت نشد"
        )

    return user


async def verify_token_with_blacklist(
    access_token: str,
    db: Session,
    redis: Redis
):
    """
    Verify token and check if it's blacklisted.
    Called from get_current_user dependency with proper redis instance.
    """
    user = verify_token(access_token=access_token, db=db)

    if redis:
        blacklisted = await redis.exists(f"blacklist:{access_token}")
        if blacklisted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="توکن باطل شده است"
            )

    return user