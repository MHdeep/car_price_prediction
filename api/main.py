from fastapi import FastAPI, status, Request, HTTPException, Body, Depends ,Cookie
from fastapi.responses import JSONResponse
from pwdlib import PasswordHash
from models.validation_model import singup_model, login_model, car_model
from auth.auth import generate_token, verify_token, verify_token_with_blacklist
from database.base import get_db, User, Car_data
from sqlalchemy.orm import Session
from prediction.prediction_car_price import car_price_prediction
from contextlib import asynccontextmanager
from redis.asyncio import Redis
import json
import numpy as np
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
import os
from fastapi.middleware.cors import CORSMiddleware
@asynccontextmanager
async def lifespen(app:FastAPI):
    app.state.redis = Redis.from_url(
        "redis://localhost:6379/0",
        decode_responses=True
    )
    await app.state.redis.ping()
    try : 
        yield 
        
    finally : 
        await app.state.redis.aclose()    



limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=os.getenv("REDIS_URL", "redis://localhost:6379/0")
)


def get_redis(request: Request) -> Redis:
    return request.app.state.redis


async def get_current_user(
    access_token: str = Cookie(default=None),
    db: Session = Depends(get_db),
    redis: Redis = Depends(get_redis)
):
    """Combined dependency: verify token + check blacklist."""
    return await verify_token_with_blacklist(
        access_token=access_token,
        db=db,
        redis=redis
    )


app = FastAPI(lifespan=lifespen)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

password_hash = PasswordHash.recommended()

def hash_passwd(passwd) -> str :
    return password_hash.hash(passwd)

def verify_passwd(passwd , hash_passwd) -> str:
    return password_hash.verify(passwd , hash_passwd)


@app.post("/api/singup/")
@limiter.limit("5/minute")
def singup(request : Request , q : singup_model = Body(...) , db:Session = Depends(get_db)):
    user = db.query(User).filter(User.email == q.email).one_or_none()
    if user : 
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT , 
            detail="exists email choese other email"
        )
    
    new_user = User(
        email=q.email , 
        name = q.name , 
        password = hash_passwd(q.password)
    )    

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return JSONResponse(
        status_code=status.HTTP_201_CREATED , 
        content={
            "detail":"created user succsessfuly"
        }
    )
    
    
@app.post("/api/login/")
@limiter.limit("20/minute")
def login(request: Request, q: login_model = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == q.email).one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="not found a user"
        )
    verify = verify_passwd(q.password, user.password)

    if not verify:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="not found a user"
        )
    token = generate_token(user.id)
    res = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "detail": "successfully"
        }
    )
    res.set_cookie(
        key="access_token",
        value=token,
        max_age=168 * 3600,
        httponly=True,
        secure=False,       # Allow HTTP on localhost
        samesite="lax",     # Better for localhost
    )

    return res
        

@app.get("/api/get-me/")
async def get_me(user: User = Depends(get_current_user)):
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "detail": "successfully"
        }
    )
        
@app.post("/api/predict/")
@limiter.limit("5/minute")
async def prediction(request: Request, user: User = Depends(get_current_user), q: car_model = Body(...)):
    car_price = car_price_prediction(
        q.brand,
        q.gerbox,
        q.fuel,
        q.colors,
        q.motor_status,
        q.chassis_status,
        q.body_status,
        q.gerbox_status
    )

    if not car_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="field prediction"
        )

    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={
            "prediction": car_price * 1000000
        }
    )    
        
BRANDS_KEY = "car-filters"

@app.get("/api/car-filters/")
@limiter.limit("5/minute")
async def brands(request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db), redis: Redis = Depends(get_redis)):
    cached = await redis.get(BRANDS_KEY)
    if cached is not None:
        return json.loads(cached)

    rows = db.query(Car_data).all()

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="empty"
        )
    data = {
        "brand": np.unique([row.brand for row in rows]).tolist(),
        "gerbox": np.unique([row.gerbox for row in rows]).tolist(),
        "fuel": np.unique([row.fuel for row in rows]).tolist(),
        "colors": np.unique([row.colors for row in rows]).tolist(),
        "motor_status": np.unique([row.motor_status for row in rows]).tolist(),
        "chassis_status": np.unique([row.chassis_status for row in rows]).tolist(),
        "body_status": np.unique([row.body_status for row in rows]).tolist(),
        "gerbox_status": np.unique([row.gerbox_status for row in rows]).tolist()
    }
    await redis.set(
        BRANDS_KEY,
        json.dumps(data),
        ex=3600
    )
    return data


@app.post("/api/logout/")
async def logout(request: Request, access_token: str = Cookie(default=None), redis: Redis = Depends(get_redis)):
    if access_token:
        # Add token to blacklist (expire in 7 days = 168 hours)
        await redis.setex(f"blacklist:{access_token}", 168 * 3600, "1")

    res = JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"detail": "خروج موفقیت‌آمیز بود"}
    )
    # Clear the cookie
    res.delete_cookie(key="access_token", httponly=True, secure=False, samesite="lax")
    return res
           