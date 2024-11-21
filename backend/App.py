# Flask imports
from flask import Flask, redirect
from flask_restful import Api
from flasgger import Swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# Controller imports
from controllers.auth_controller import Register, Login, Logout, GetUserRole
from controllers.cat_controller import CatList, CatById
from controllers.cat_photo_controller import CatPhotoUpload, CatPhotoDelete, CatPhotoRetrieve, CatPhotoServe
from controllers.species_controller import SpeciesList, SpeciesById
from controllers.examination_controller import ExaminationRequestList, ExaminationRequestById
from controllers.healthrec_controller import HealthRecordList,  HealthRecordById
from controllers.availableslot_controller import AvailableSlotList, AvailableSlotById
from controllers.reservationrequest_controller import ReservationList, ReservationById
from controllers.users_controller import UserById, UserList, UnverifiedVolunteers

# DB import
from models.database import db


app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://utulekAdmin:smisek123@localhost/utulek'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SWAGGER'] = {
    'title': 'Utulek Management API',
}
app.config['JWT_SECRET_KEY'] = 'super-secret'
app.config['JWT_TOKEN_LOCATION'] = ['cookies']  # Store JWT in cookies
app.config['JWT_COOKIE_SECURE'] = True  # Only send cookie over HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Enable CSRF protection
app.config['JWT_COOKIE_SAMESITE'] = 'None'
#   app.config['JWT_CSRF_IN_COOKIES'] = True # Neni technika
CORS(app, supports_credentials=True, origins="http://localhost:5173")

api = Api(app)
swagger = Swagger(app)
jwt = JWTManager(app)

db.init_app(app)

# Reroute to Swagger UI
@app.route('/')
def home():
    return redirect('/apidocs', code=302)

api.add_resource(Register, '/auth/register')
api.add_resource(Login, '/auth/login')
api.add_resource(Logout, '/auth/logout')
api.add_resource(GetUserRole, '/auth/role')

api.add_resource(CatList, '/cats')
api.add_resource(CatById, '/cats/<int:cat_id>')

api.add_resource(SpeciesList, '/species')
api.add_resource(SpeciesById, '/species/<int:species_id>')

api.add_resource(CatPhotoUpload, '/cat/photo/upload')
api.add_resource(CatPhotoDelete, '/cat/photo/delete/<int:id>')
api.add_resource(CatPhotoRetrieve, '/cat/photo/retrieve/<int:id>')
api.add_resource(CatPhotoServe, '/catphotos/<path:filename>')
app.add_url_rule('/catphotos/<path:filename>', view_func=CatPhotoServe.as_view('cat_photo_serve'))

api.add_resource(ExaminationRequestList, '/examinationrequests')
api.add_resource(ExaminationRequestById, '/examinationrequests/<int:examination_request_id>')

api.add_resource(HealthRecordList, '/healthrecords/<int:cat_id>')
api.add_resource(HealthRecordById, '/healthrecord/<int:health_record_id>')

api.add_resource(AvailableSlotList, '/availableslots')
api.add_resource(AvailableSlotById, '/availableslots/<int:slot_id>')

api.add_resource(ReservationList, '/reservationrequests')
api.add_resource(ReservationById, '/reservationrequests/<int:reservation_request_id>')

api.add_resource(UserList, '/admin/users') 
api.add_resource(UserById, '/admin/users/<int:user_id>')

api.add_resource(UnverifiedVolunteers, '/caregiver/unverified_volunteers')
