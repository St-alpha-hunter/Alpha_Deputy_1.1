from sqlalchemy import Column, BigInteger, String, Date
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Asset(Base):
    __tablename__ = 'asset'  # 注意大小写要和 C# 中一致

    sid = Column(BigInteger, primary_key=True, autoincrement=True)  # 主键类型与C#一致
    symbol = Column(String(20), unique=True, nullable=False)        # 股票代码
    industry = Column(String(50), nullable=True)                    # 行业，可选
    assetname = Column(String(100), nullable=True)                  # 公司名称，可选
    exchange = Column(String(50), nullable=True)                    # 交易所，可选
    startdate = Column(Date, nullable=False)                        # 开始日期，必填
    enddate = Column(Date, nullable=False)                          # 结束日期，必填
    autoclosedate = Column(Date, nullable=True)                     # 可选
    firsttraded = Column(Date, nullable=True)                       # 可选


    def __repr__(self):
        return f"<Asset(Symbol='{self.symbol}', StartDate={self.startdate})>"