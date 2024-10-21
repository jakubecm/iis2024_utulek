from models.database import db

class HealthRecord(db.Model):
    __tablename__ = 'healthrecords'
    __table_args__ = {'schema': 'utulek'}

    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    CatId = db.Column(db.BigInteger, db.ForeignKey('utulek.cats.Id'), nullable=False)
    Date = db.Column(db.Date, nullable=False)
    Description = db.Column(db.String(200), nullable=False)
    VetId = db.Column(db.BigInteger, db.ForeignKey('utulek.users.Id'), nullable=False)
