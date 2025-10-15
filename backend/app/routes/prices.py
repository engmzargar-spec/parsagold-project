from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import GoldPrice
from ..schemas import GoldPriceResponse

router = APIRouter(prefix="/api/prices", tags=["prices"])

@router.get("/", response_model=List[GoldPriceResponse])
def get_gold_prices(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    prices = db.query(GoldPrice).offset(skip).limit(limit).all()
    return prices

@router.get("/{gold_type}", response_model=GoldPriceResponse)
def get_gold_price(gold_type: str, db: Session = Depends(get_db)):
    price = db.query(GoldPrice).filter(GoldPrice.gold_type == gold_type).first()
    if price is None:
        raise HTTPException(status_code=404, detail="Gold type not found")
    return price