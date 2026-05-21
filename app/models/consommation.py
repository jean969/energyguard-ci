from sqlalchemy import Float, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base

class Consommation(Base):
    __tablename__ = "consommation"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("zones.id"), nullable=False)
    valeur_kwh: Mapped[float] = mapped_column(Float, nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=True)
    ensoleillement: Mapped[float] = mapped_column(Float, nullable=True)
    heure: Mapped[int] = mapped_column(Integer, nullable=True)
    jour_semaine: Mapped[int] = mapped_column(Integer, nullable=True)
    est_saison_pluie: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone")