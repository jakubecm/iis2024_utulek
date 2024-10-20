from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class ExaminationRequest(db.Model):
    __tablename__ = 'examinationrequests'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    CatId = db.Column(db.BigInteger, db.ForeignKey('utulek.cats.Id'), nullable=False)
    CaregiverId = db.Column(db.BigInteger, db.ForeignKey('utulek.users.Id'), nullable=False)
    RequestDate = db.Column(db.Date, nullable=False)
    Description = db.Column(db.String(200), nullable=False)
    Status = db.Column(db.SmallInteger, nullable=False)