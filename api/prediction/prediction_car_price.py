import tensorflow as tf
import pickle
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "my_model.keras"
TOKENIZER_PATH = BASE_DIR / "tokenizer.pickle"


_model = tf.keras.models.load_model(str(MODEL_PATH))
with open(TOKENIZER_PATH, "rb") as f:
    _tokenizer = pickle.load(f)


def _make_text(
    brand,
    gerbox, 
    fuel , 
    colors,
    motor_status,
    chassis_status,
    body_status,
    gerbox_status
):
    
    parts = [brand, gerbox, fuel, colors,
             motor_status, chassis_status, body_status, gerbox_status]
    return " ".join(str(p) for p in parts).replace("\u200c", " ")


def car_price_prediction(
    brand,
    gerbox,
    fuel,
    colors,
    motor_status,
    chassis_status,
    body_status,
    gerbox_status
):
    text = _make_text(brand, gerbox, fuel, colors,motor_status, chassis_status, body_status, gerbox_status)
    x_tok = _tokenizer(np.array([text]))    
    pred_log = _model.predict(x_tok, verbose=0)[0][0]
    return float(np.expm1(pred_log))              


#simple!
#print(car_price_prediction("آئودی Q5", "اتوماتیک", "بنزین", "مشکی","سالم", "سالم و پلمپ", "سالم و بی‌خط و خش", "سالم و پلمپ") )                         