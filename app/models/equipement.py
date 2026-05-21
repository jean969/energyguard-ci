from sqlalchemy import String, Float, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base

class Equipement(Base):
    __tablename__ = "equipements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("zones.id"), nullable=False)
    nom: Mapped[str] = mapped_column(String, nullable=False)
    type_equipement: Mapped[str] = mapped_column(String, nullable=False)
    score_anomalie: Mapped[float] = mapped_column(Float, default=0.0)
    est_a_risque: Mapped[bool] = mapped_column(Boolean, default=False)
    temperature_actuelle: Mapped[float] = mapped_column(Float, nullable=True)
    charge_actuelle: Mapped[float] = mapped_column(Float, nullable=True)
    derniere_maintenance: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone")