from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from werkzeug.security import generate_password_hash, check_password_hash
from models.User import User
from flask_jwt_extended import create_access_token, set_access_cookies, unset_jwt_cookies
from flasgger import swag_from
from models.database import db

class Register(Resource):
    @swag_from({
        'tags': ['Authentication'],
        'summary': 'Register a new user',
        'responses': {
            201: {
                'description': 'User created successfully',
                'examples': {
                    'application/json': {'msg': 'User created successfully'}
                }
            },
            409: {
                'description': 'Username already exists',
                'examples': {
                    'application/json': {'msg': 'Username already exists'}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'username': {
                            'type': 'string'
                        },
                        'email': {
                            'type': 'string'
                        },
                        'password': {
                            'type': 'string'
                        },
                        'first_name': {
                            'type': 'string'
                        },
                        'last_name': {
                            'type': 'string'
                        },
                    },
                    'required': ['username', 'email', 'password']
                },
                'description': 'JSON object with username, email, and password'
            }
        ]
    })
    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, help="Username cannot be blank.")
        parser.add_argument('email', required=True, help="Email cannot be blank.")
        parser.add_argument('password', required=True, help="Password cannot be blank.")
        parser.add_argument('first_name', required=True, help="First name cannot be blank.")
        parser.add_argument('last_name', required=True, help="Last name cannot be blank.")
        args = parser.parse_args()

        if User.query.filter_by(Username=args['username']).first():
            return {"msg": "Username already exists"}, 409

        hashed_password = generate_password_hash(args['password'])
        new_user = User(
            Username = args['username'], 
            Email = args['email'],
            Hashed_pass = hashed_password,
            FirstName = args['first_name'],
            LastName = args['last_name'],
            role=0
        )
        db.session.add(new_user)
        db.session.commit()

        return {"msg": "User created successfully"}, 201

class Login(Resource):
    @swag_from({
        'tags': ['Authentication'],
        'summary': 'Login to the system',
        'responses': {
            200: {
                'description': 'Login successful',
                'examples': {
                    'application/json': {'login': True}
                }
            },
            401: {
                'description': 'Invalid username or password',
                'examples': {
                    'application/json': {'msg': 'Invalid username or password', 'login': False}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'username': {'type': 'string'},
                        'password': {'type': 'string'}
                    },
                    'required': ['username', 'password']
                },
                'description': 'JSON object containing username and password'
            }
        ]
    })

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, help="Username cannot be blank.")
        parser.add_argument('password', required=True, help="Password cannot be blank.")
        args = parser.parse_args()

        user = User.query.filter_by(Username=args['username']).first()
        if user and check_password_hash(user.Hashed_pass, args['password']):
            access_token = create_access_token(identity=args['username'])
            response = jsonify({'login': True})  # Create a JSON response
            response = make_response(response)   # Convert to modifiable response
            set_access_cookies(response, access_token)  # Set the JWT cookies
            return response  # No need to serialize further

        return jsonify({"msg": "Invalid username or password", 'login': False}), 401
    
class Logout(Resource):
    @swag_from({
        'tags': ['Authentication'],
        'summary': 'Logout from the system',
        'responses': {
            200: {
                'description': 'Logout successful',
                'examples': {
                    'application/json': {'logout': True}
                }
            }
        }
    })
    def post(self):
        # Create a response indicating the user is logged out
        response = jsonify({'logout': True})
        # Unset the JWT cookies to log the user out
        unset_jwt_cookies(response)
        return response, 200