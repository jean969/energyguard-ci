from sqlalchemy import Float, String, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("zones.id"), nullable=False)
    score_risque: Mapped[float] = mapped_column(Float, nullable=False)
    niveau_risque: Mapped[str] = mapped_column(String, nullable=False)
    consommation_prevue_kwh: Mapped[float] = mapped_column(Float, nullable=True)
    horizon_heures: Mapped[int] = mapped_column(Integer, default=24)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone")