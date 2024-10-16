# Flask-RESTful, Flask-Cors, Flask-SQLAlchemy, psycopg2, Flask-Swagger, Flask-JWT-Extended,...
from flask import Flask
from flask_restful import Api
from models.User import db
from controllers.auth_controller import Register, Login, Logout
from models.Cat import db
from controllers.cat_controller import CatList, CatById
from controllers.species_controller import SpeciesList, SpeciesById
from flasgger import Swagger
from flask_jwt_extended import JWTManager
from flask_cors import CORS


app = Flask(__name__)
CORS(app, supports_credentials=True, origins="http://localhost:5173")
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://utulekAdmin:smisek123@localhost/utulek'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SWAGGER'] = {
    'title': 'Utulek Management API',
    'uiversion': 3
}
app.config['JWT_SECRET_KEY'] = 'super-secret'
app.config['JWT_TOKEN_LOCATION'] = ['cookies']  # Store JWT in cookies
app.config['JWT_COOKIE_SECURE'] = True  # Only send cookie over HTTPS
app.config['JWT_COOKIE_CSRF_PROTECT'] = True  # Enable CSRF protection

api = Api(app)
swagger = Swagger(app)
jwt = JWTManager(app)

db.init_app(app)

api.add_resource(Register, '/auth/register')
api.add_resource(Login, '/auth/login')
api.add_resource(Logout, '/auth/logout')

api.add_resource(CatList, '/cats')
api.add_resource(CatById, '/cats/<int:cat_id>')

api.add_resource(SpeciesList, '/species')
api.add_resource(SpeciesById, '/species/<int:species_id>')
