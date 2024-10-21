from models.database import db

class AvailableSlot(db.Model):
    __tablename__ = 'availableslots'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    CatId = db.Column(db.BigInteger, db.ForeignKey('utulek.cats.Id'), nullable=False)
    StartTime = db.Column(db.DateTime, nullable=False)
    EndTime = db.Column(db.DateTime, nullable=False)
    Status = db.Column(db.SmallInteger, nullable=False)