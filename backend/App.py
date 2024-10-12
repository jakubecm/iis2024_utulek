# Flask-RESTful, Flask-Cors, Flask-SQLAlchemy, psycopg2, Flask-Swagger, Flask-JWT-Extended,...
from flask import Flask
from flask_restful import Api
from models.User import db
from controllers.auth_controller import Register, Login
from flasgger import Swagger
from flask_jwt_extended import JWTManager

app = Flask(__name__)
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://utulekAdmin:smisek123@localhost/utulek'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SWAGGER'] = {
    'title': 'Utulek Management API',
    'uiversion': 3
}
app.config['JWT_SECRET_KEY'] = 'super-secret'

api = Api(app)
swagger = Swagger(app)
jwt = JWTManager(app)

db.init_app(app)

api.add_resource(Register, '/auth/register')
api.add_resource(Login, '/auth/login')

