from dotenv import load_dotenv
import os

def secret() -> str : 
    load_dotenv()
    secrets = os.getenv("SECRET")
    return secrets


def settings(): 
    pass