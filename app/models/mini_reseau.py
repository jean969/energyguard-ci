from sqlalchemy import String, Float, Boolean, DateTime, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.database import Base

class MiniReseau(Base):
    __tablename__ = "mini_reseaux"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    zone_id: Mapped[int] = mapped_column(Integer, ForeignKey("zones.id"), nullable=False)
    nom_village: Mapped[str] = mapped_column(String, nullable=False)
    nb_panneaux_solaires: Mapped[int] = mapped_column(Integer, default=0)
    capacite_batterie_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    niveau_batterie_pct: Mapped[float] = mapped_column(Float, default=0.0)
    production_solaire_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    consommation_prevue_soir_kwh: Mapped[float] = mapped_column(Float, default=0.0)
    est_alerte_batterie: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    zone = relationship("Zone")