from models.database import db

class Species(db.Model):
    __tablename__ = 'species'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(30), nullable=False)

class Cats(db.Model):
    __tablename__ = 'cats'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    Name = db.Column(db.String(30), nullable=False)
    SpeciesId = db.Column(db.BigInteger, db.ForeignKey('utulek.species.Id'), nullable=False)
    Age = db.Column(db.Integer, nullable=False)
    Description = db.Column(db.String(100), nullable=False)
    Found = db.Column(db.Date, nullable=False)

class CatPhotos(db.Model):
    __tablename__ = 'catphotos'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    CatId = db.Column(db.BigInteger, db.ForeignKey('utulek.cats.Id'), primary_key=True)
    PhotoUrl = db.Column(db.String(100), nullable=False)