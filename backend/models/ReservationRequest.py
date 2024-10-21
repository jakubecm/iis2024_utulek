from models.database import db

class ReservationRequest(db.Model):
    __tablename__ = 'reservationrequests'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    SlotId = db.Column(db.BigInteger, db.ForeignKey('utulek.availableslots.Id'), nullable=False)
    VolunteerId = db.Column(db.BigInteger, db.ForeignKey('utulek.users.Id'), nullable=False)
    RequestDate = db.Column(db.Date, nullable=False)
    Status = db.Column(db.SmallInteger, nullable=False)