from models.database import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    __table_args__ = {'schema': 'utulek'}
    Id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    Username = db.Column(db.String(30), unique=True, nullable=False)
    Hashed_pass = db.Column(db.String(200), nullable=False)
    FirstName = db.Column(db.String(30), nullable=False)
    LastName = db.Column(db.String(30), nullable=False)
    Email = db.Column(db.String(50), unique=True, nullable=False)
    role = db.Column(db.SmallInteger, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
class Veterinarian(db.Model):
    __tablename__ = 'vets'
    __table_args__ = {'schema': 'utulek'}
    UserId = db.Column(db.BigInteger, db.ForeignKey('utulek.users.Id'), primary_key=True)
    Specialization = db.Column(db.String(30), nullable=False)
    Telephone = db.Column(db.String(20), nullable=False)

class Volunteer(db.Model):
    __tablename__ = 'volunteers'
    __table_args__ = {'schema': 'utulek'}
    UserId = db.Column(db.BigInteger, db.ForeignKey('utulek.users.Id'), primary_key=True)
    verified = db.Column(db.Boolean, nullable=False, default=False)

