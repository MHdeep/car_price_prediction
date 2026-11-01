from sqlalchemy import create_engine , Column , Integer , String , DATETIME 
from sqlalchemy.orm import Session , sessionmaker , DeclarativeBase
from datetime import datetime, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DB_PATH  = BASE_DIR / "data.db"

engine = create_engine(
    f"sqlite:///{DB_PATH}" , 
    echo=True
)

local_Session = sessionmaker(
    autoflush=False , 
    autocommit=False , 
    bind=engine
)

class Base (DeclarativeBase):
    pass 

class User(Base) : 
    __tablename__ = "users"
    id = Column(Integer , autoincrement=True , primary_key=True) 
    name = Column(String(100) , nullable=False)
    email = Column(String(150) , nullable=False)
    password = Column(String(100) , nullable= False)
    create_at = Column(DATETIME , default=datetime.now(timezone.utc))


class Car_data(Base):
    __tablename__ = "car_data"
    
    id = Column(Integer , autoincrement=True , primary_key=True) 
    brand = Column(String(100))
    gerbox = Column(String(100))
    fuel = Column(String(100))
    price = Column(Integer) 
    bemaeh = Column(Integer)
    km = Column(Integer) 
    colors = Column(String(100))
    motor_status = Column(String(100))
    chassis_status = Column(String(100))
    body_status = Column(String(100)) 
    gerbox_status = Column(String(100))



Base.metadata.create_all(bind=engine)


def  get_db():
    db = local_Session()

    try : 
        yield db 
        
    finally : 
        db.close()    



