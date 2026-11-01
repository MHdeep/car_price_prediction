from pydantic import BaseModel , Field ,EmailStr , field_validator
import re


class singup_model(BaseModel):
    email : EmailStr = Field(max_length=100)
    name : str = Field(min_length=3 ,max_length=50)
    password : str = Field(min_length=8 , max_length=100)
    
    @field_validator("password")
    @classmethod 
    def validate_password(cls , v :str) -> str :
        if not len(v) > 8 :
            raise ValueError("password is small length choese longer length")
        
        if not re.search(r"[A-Z]" , v) : 
            raise ValueError("noting used a uppercase in a password")
        
        if not re.search(r"[a-z]" , v) :
            raise ValueError("noting used a lowercase in a password")
        
        if not re.search(r"\d" , v):
            raise ValueError("noting used a digits in a password")
        
        return v       
        
class login_model (BaseModel):
    email : EmailStr = Field(max_length=100)
    password : str = Field(min_length=8 , max_length=100)         
    @field_validator("password")
    @classmethod 
    def validate_password(cls , v :str) -> str :
        if not len(v) > 8 :
            raise ValueError("password is small length choese longer length")
        
        if not re.search(r"[A-Z]" , v) : 
            raise ValueError("noting used a uppercase in a password")
        
        if not re.search(r"[a-z]" , v) :
            raise ValueError("noting used a lowercase in a password")
        
        if not re.search(r"\d" , v):
            raise ValueError("noting used a digits in a password")
        
        return v
    
    
class car_model(BaseModel):
    brand:str = Field(max_length=120 , min_length=2)
    gerbox:str = Field(max_length=120 , min_length=2)
    fuel:str = Field(max_length=120 , min_length=2)
    colors:str = Field(max_length=120 , min_length=2)
    motor_status:str = Field(max_length=120 , min_length=2)
    chassis_status:str = Field(max_length=120 , min_length=2)
    body_status:str = Field(max_length=120 , min_length=2)
    gerbox_status:str = Field(max_length=120 , min_length=2)