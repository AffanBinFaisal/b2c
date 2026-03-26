from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId
from app.database import get_database
from app.schemas.user import UserRegister, UserLogin, UserResponse, UserUpdate, PasswordChange, Token
from app.utils.auth import get_password_hash, verify_password, create_access_token, get_current_user, get_current_user_id
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_dict = {
        "email": user_data.email,
        "passwordHash": get_password_hash(user_data.password),
        "name": user_data.name,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "lastLoginAt": None,
        "preferences": {"searchLogic": "AND"},
        "deletedAt": None
    }
    
    result = await db.users.insert_one(user_dict)
    user_dict["_id"] = result.inserted_id
    
    # Convert ObjectId to string for response
    user_response = {
        "_id": str(user_dict["_id"]),
        "email": user_dict["email"],
        "name": user_dict["name"],
        "createdAt": user_dict["createdAt"],
        "lastLoginAt": user_dict["lastLoginAt"],
        "preferences": user_dict["preferences"]
    }
    
    return user_response


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    """Login user and return access token"""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": user_data.email, "deletedAt": None})
    if not user or not verify_password(user_data.password, user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLoginAt": datetime.utcnow()}}
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "_id": str(current_user["_id"]),
        "email": current_user["email"],
        "name": current_user["name"],
        "createdAt": current_user["createdAt"],
        "lastLoginAt": current_user.get("lastLoginAt"),
        "preferences": current_user.get("preferences", {"searchLogic": "AND"})
    }


@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
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
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": current_user["_id"]})
    
    return {
        "_id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "name": updated_user["name"],
        "createdAt": updated_user["createdAt"],
        "lastLoginAt": updated_user.get("lastLoginAt"),
        "preferences": updated_user.get("preferences", {"searchLogic": "AND"})
    }


@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: dict = Depends(get_current_user)
):
    """Change user password"""
    db = get_database()
    
    # Verify current password
    if not verify_password(password_data.currentPassword, current_user["passwordHash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "passwordHash": get_password_hash(password_data.newPassword),
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Password changed successfully"}


@router.delete("/me")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """Soft delete user account (30-day recovery period)"""
    db = get_database()
    
    await db.users.update_one(
        {"_id": current_user["_id"]},
        {
            "$set": {
                "deletedAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"message": "Account deleted successfully. You have 30 days to recover your account."}
