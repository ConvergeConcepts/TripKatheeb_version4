from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator
from datetime import datetime, timedelta
import os
import uuid
import json
from passlib.context import CryptContext
from jose import JWTError, jwt
import base64
from bson import json_util
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "travel_db")

# Security configuration
SECRET_KEY = "supersecretkey"  # In production, use a secure environment variable
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Connect to MongoDB
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 token URL
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

# Initialize FastAPI
app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Models ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class AdminUserBase(BaseModel):
    username: str

class AdminUserCreate(AdminUserBase):
    password: str

class AdminUser(AdminUserBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {datetime: lambda v: v.isoformat()}

class BaseConfig:
    """Base configuration for Pydantic models"""
    json_encoders = {
        datetime: lambda dt: dt.isoformat()
    }
    populate_by_name = True

class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    class Config(BaseConfig):
        pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class TravelDateRange(BaseModel):
    start_date: str
    end_date: str
    
    class Config(BaseConfig):
        pass

class ContactInfo(BaseModel):
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    
    class Config(BaseConfig):
        pass

class TravelOfferBase(BaseModel):
    title: str
    destination: str
    description: str
    price: float
    travel_dates: TravelDateRange
    company_name: str
    company_website: str
    category: str
    images: List[str] = []
    contact_info: Optional[ContactInfo] = None
    highlights: Optional[List[str]] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    itinerary: Optional[str] = None

class TravelOfferCreate(TravelOfferBase):
    pass

class TravelOffer(TravelOfferBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    class Config(BaseConfig):
        pass

class TravelOfferUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    travel_dates: Optional[TravelDateRange] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    category: Optional[str] = None
    images: Optional[List[str]] = None
    contact_info: Optional[ContactInfo] = None
    highlights: Optional[List[str]] = None
    inclusions: Optional[List[str]] = None
    exclusions: Optional[List[str]] = None
    itinerary: Optional[str] = None

# Advertisement Models
class AdPlacement(BaseModel):
    location: str
    description: Optional[str] = None

class AdvertisementBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: str
    link_url: str
    placement: AdPlacement
    is_active: bool = True

class AdvertisementCreate(AdvertisementBase):
    pass

class Advertisement(AdvertisementBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    
    class Config(BaseConfig):
        pass

class AdvertisementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    link_url: Optional[str] = None
    placement: Optional[AdPlacement] = None
    is_active: Optional[bool] = None

# --- Helper Functions ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str):
    user = db.admin_users.find_one({"username": username})
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.admin_users.find_one({"username": token_data.username})
    if user is None:
        raise credentials_exception
    return user

def parse_json(data):
    """
    Convert MongoDB document to JSON serializable format.
    Handle date objects explicitly.
    """
    def convert_dates(obj):
        if isinstance(obj, dict):
            for key, value in obj.items():
                if isinstance(value, dict) and "$date" in value:
                    obj[key] = datetime.fromisoformat(value["$date"].replace("Z", "+00:00"))
                elif isinstance(value, dict):
                    convert_dates(value)
                elif isinstance(value, list):
                    for item in value:
                        if isinstance(item, dict):
                            convert_dates(item)
        return obj
    
    # First convert to JSON format using bson.json_util
    json_str = json_util.dumps(data)
    parsed_data = json.loads(json_str)
    
    # Handle date objects
    if isinstance(parsed_data, list):
        for item in parsed_data:
            convert_dates(item)
    elif isinstance(parsed_data, dict):
        convert_dates(parsed_data)
    
    return parsed_data

# --- API Routes ---

@app.get("/api/")
async def root():
    return {"message": "Welcome to the Maldives Travel Offers API"}

# Public Endpoints

@app.get("/api/offers")
async def get_travel_offers(
    destination: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = None,
):
    query = {}
    
    # Apply filters
    if destination:
        query["destination"] = {"$regex": destination, "$options": "i"}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}
    if min_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$gte"] = min_price
    if max_price is not None:
        query["price"] = query.get("price", {})
        query["price"]["$lte"] = max_price
    
    # Apply sorting
    sort_params = []
    if sort_by:
        sort_direction = -1 if sort_order and sort_order.lower() == "desc" else 1
        sort_params.append((sort_by, sort_direction))
    else:
        # Default sorting by created_at (newest first)
        sort_params.append(("created_at", -1))
    
    offers = list(db.travel_offers.find(query).sort(sort_params))
    return parse_json(offers)

@app.get("/api/offers/{offer_id}")
async def get_travel_offer(offer_id: str):
    offer = db.travel_offers.find_one({"id": offer_id})
    if offer is None:
        raise HTTPException(status_code=404, detail="Travel offer not found")
    return parse_json(offer)

@app.get("/api/categories")
async def get_categories():
    categories = db.travel_offers.distinct("category")
    return {"categories": categories}

# Admin Endpoints - Category Management

@app.get("/api/admin/categories")
async def get_all_categories(current_user: dict = Depends(get_current_user)):
    categories = list(db.categories.find())
    return parse_json(categories)

@app.post("/api/admin/categories")
async def create_category(category: CategoryCreate, current_user: dict = Depends(get_current_user)):
    # Check if category already exists
    existing = db.categories.find_one({"name": category.name})
    if existing:
        raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    category_obj = Category(**category.dict())
    category_dict = category_obj.dict()
    
    # Save to database
    db.categories.insert_one(category_dict)
    
    return category_obj

@app.put("/api/admin/categories/{category_id}")
async def update_category(
    category_id: str,
    category_update: CategoryUpdate,
    current_user: dict = Depends(get_current_user)
):
    existing = db.categories.find_one({"id": category_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if updating to a name that already exists
    if category_update.name:
        name_exists = db.categories.find_one({"name": category_update.name, "id": {"$ne": category_id}})
        if name_exists:
            raise HTTPException(status_code=400, detail="Category with this name already exists")
    
    update_data = {k: v for k, v in category_update.dict().items() if v is not None}
    
    db.categories.update_one(
        {"id": category_id},
        {"$set": update_data}
    )
    
    updated_category = db.categories.find_one({"id": category_id})
    return parse_json(updated_category)

@app.delete("/api/admin/categories/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(get_current_user)):
    # Check if category is being used by any offer
    offers_using_category = db.travel_offers.find_one({"category": category_id})
    if offers_using_category:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete category that is being used by travel offers"
        )
    
    result = db.categories.delete_one({"id": category_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return {"message": "Category deleted successfully"}

# Admin Endpoints - Authentication and Offers

@app.post("/api/admin/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/admin/offers")
async def create_travel_offer(offer: TravelOfferCreate, current_user: dict = Depends(get_current_user)):
    travel_offer = TravelOffer(**offer.dict())
    travel_offer_dict = travel_offer.dict()
    
    # Save to database
    db.travel_offers.insert_one(travel_offer_dict)
    
    return travel_offer

@app.put("/api/admin/offers/{offer_id}")
async def update_travel_offer(
    offer_id: str, 
    offer_update: TravelOfferUpdate, 
    current_user: dict = Depends(get_current_user)
):
    existing_offer = db.travel_offers.find_one({"id": offer_id})
    if existing_offer is None:
        raise HTTPException(status_code=404, detail="Travel offer not found")
    
    # Update fields that are provided
    update_data = {k: v for k, v in offer_update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    db.travel_offers.update_one(
        {"id": offer_id},
        {"$set": update_data}
    )
    
    updated_offer = db.travel_offers.find_one({"id": offer_id})
    return parse_json(updated_offer)

@app.delete("/api/admin/offers/{offer_id}")
async def delete_travel_offer(offer_id: str, current_user: dict = Depends(get_current_user)):
    result = db.travel_offers.delete_one({"id": offer_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Travel offer not found")
    
    return {"message": "Travel offer deleted successfully"}

# Advertisement Management Endpoints
@app.get("/api/advertisements")
async def get_advertisements(location: Optional[str] = None, active_only: bool = True):
    """Get advertisements, optionally filtered by location and active status"""
    query = {}
    
    if location:
        query["placement.location"] = location
        
    if active_only:
        query["is_active"] = True
        
    ads = list(db.advertisements.find(query))
    return parse_json(ads)

@app.get("/api/advertisements/{ad_id}")
async def get_advertisement(ad_id: str):
    """Get a specific advertisement by ID"""
    ad = db.advertisements.find_one({"id": ad_id})
    if ad is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    return parse_json(ad)

@app.post("/api/admin/advertisements")
async def create_advertisement(ad: AdvertisementCreate, current_user: dict = Depends(get_current_user)):
    """Create a new advertisement (admin only)"""
    advertisement = Advertisement(**ad.dict())
    advertisement_dict = advertisement.dict()
    
    # Save to database
    db.advertisements.insert_one(advertisement_dict)
    
    return advertisement

@app.put("/api/admin/advertisements/{ad_id}")
async def update_advertisement(
    ad_id: str, 
    ad_update: AdvertisementUpdate, 
    current_user: dict = Depends(get_current_user)
):
    """Update an existing advertisement (admin only)"""
    existing_ad = db.advertisements.find_one({"id": ad_id})
    if existing_ad is None:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    # Update fields that are provided
    update_data = {k: v for k, v in ad_update.dict(exclude_unset=True).items() if v is not None}
    update_data["updated_at"] = datetime.utcnow().isoformat()
    
    db.advertisements.update_one(
        {"id": ad_id},
        {"$set": update_data}
    )
    
    updated_ad = db.advertisements.find_one({"id": ad_id})
    return parse_json(updated_ad)

@app.delete("/api/admin/advertisements/{ad_id}")
async def delete_advertisement(ad_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an advertisement (admin only)"""
    result = db.advertisements.delete_one({"id": ad_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Advertisement not found")
    
    return {"message": "Advertisement deleted successfully"}

@app.post("/api/admin/upload")
async def upload_image(file: UploadFile = File(...), current_user: dict = Depends(get_current_user)):
    contents = await file.read()
    # For simplicity, we're encoding the image as base64 and returning it
    # In a production environment, you would store this in a file system or cloud storage
    encoded_string = base64.b64encode(contents).decode("utf-8")
    image_url = f"data:{file.content_type};base64,{encoded_string}"
    
    return {"image_url": image_url}

@app.post("/api/admin/create-default-admin")
async def create_default_admin():
    # Check if admin exists
    admin_exists = db.admin_users.find_one({"username": "admin"})
    if admin_exists:
        return {"message": "Default admin already exists"}
    
    # Create default admin user
    hashed_password = get_password_hash("admin123")
    admin_user = {
        "id": str(uuid.uuid4()),
        "username": "admin",
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow()
    }
    
    db.admin_users.insert_one(admin_user)
    return {"message": "Default admin created successfully"}

# --- Startup and shutdown events ---

@app.on_event("startup")
async def startup_db_client():
    # Create collections if they don't exist
    db.create_collection("admin_users", check_exists=False)
    db.create_collection("travel_offers", check_exists=False)
    db.create_collection("categories", check_exists=False)
    
    # Create indexes
    db.travel_offers.create_index("id", unique=True)
    db.travel_offers.create_index("destination")
    db.travel_offers.create_index("category")
    db.travel_offers.create_index("price")
    
    db.admin_users.create_index("username", unique=True)
    db.categories.create_index("id", unique=True)
    db.categories.create_index("name", unique=True)
    
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
