from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from ..database import get_db
from ..models import Trade, User, GoldPrice
from ..schemas import TradeCreate, TradeResponse
from ..auth import verify_token

router = APIRouter(prefix="/api/trades", tags=["trades"])

def get_current_user(token: str, db: Session = Depends(get_db)):
    username = verify_token(token)
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=TradeResponse)
def create_trade(
    trade: TradeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get current gold price
    gold_price = db.query(GoldPrice).filter(GoldPrice.gold_type == trade.gold_type).first()
    if not gold_price:
        raise HTTPException(status_code=404, detail="Gold type not found")
    
    total_amount = trade.amount * gold_price.price
    
    # Check user balance for buy trades
    if trade.trade_type == "buy":
        if current_user.balance < total_amount:
            raise HTTPException(
                status_code=400, 
                detail="Insufficient balance"
            )
        # Deduct from balance
        current_user.balance -= total_amount
    else:  # sell
        # For now, just add to balance
        current_user.balance += total_amount
    
    # Create trade record
    db_trade = Trade(
        user_id=current_user.id,
        gold_type=trade.gold_type,
        amount=trade.amount,
        price=gold_price.price,
        total_amount=total_amount,
        trade_type=trade.trade_type,
        status="completed"
    )
    
    db.add(db_trade)
    db.commit()
    db.refresh(db_trade)
    
    return db_trade

@router.get("/", response_model=List[TradeResponse])
def get_user_trades(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trades = db.query(Trade).filter(Trade.user_id == current_user.id).all()
    return trades

@router.get("/{trade_id}", response_model=TradeResponse)
def get_trade(
    trade_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    trade = db.query(Trade).filter(
        Trade.id == trade_id, 
        Trade.user_id == current_user.id
    ).first()
    
    if trade is None:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade