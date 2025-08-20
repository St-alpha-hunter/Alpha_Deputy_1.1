import pandas as pd
import sqlalchemy
import os

from dotenv import load_dotenv
load_dotenv()

DB_URL = os.getenv("DB_URL")
engine = sqlalchemy.create_engine(DB_URL, echo=True)
df = pd.read_sql("SELECT symbol, industry FROM asset", engine)
df.to_csv("symbol_to_industry.csv", index=False)