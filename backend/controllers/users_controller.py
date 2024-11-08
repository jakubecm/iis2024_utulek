from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from flasgger import swag_from
from models.User import User
from models.database import db

class UserManagement(Resource):
    @swag_from({
        'tags': ['Admin'],
        'summary': 'Create a new user (Admin only)',
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
            },
            403: {
                'description': 'Admin access required',
                'examples': {
                    'application/json': {'msg': 'Admin access required'}
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
                        'email': {'type': 'string'},
                        'password': {'type': 'string'},
                        'role': {'type': 'integer', 'default': 1}
                    },
                    'required': ['username', 'email', 'password']
                },
                'description': 'JSON object with username, email, password, and optional role'
            }
        ]
    })
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user['role'] != 0:
            return {"msg": "Admin access required"}, 403

        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, help="Username cannot be blank.")
        parser.add_argument('email', required=True, help="Email cannot be blank.")
        parser.add_argument('password', required=True, help="Password cannot be blank.")
        parser.add_argument('role', type=int, default=1, help="Role cannot be blank.")  # default role is 1 for non-admin users
        args = parser.parse_args()

        if User.query.filter_by(Username=args['username']).first():
            return {"msg": "Username already exists"}, 409

        hashed_password = generate_password_hash(args['password'])
        new_user = User(
            Username=args['username'],
            Email=args['email'],
            Hashed_pass=hashed_password,
            role=args['role']
        )
        db.session.add(new_user)
        db.session.commit()

        return {"msg": "User created successfully"}, 201

    @swag_from({
        'tags': ['Admin'],
        'summary': 'Delete a user by ID (Admin only)',
        'responses': {
            200: {
                'description': 'User deleted successfully',
                'examples': {
                    'application/json': {'msg': 'User deleted successfully'}
                }
            },
            404: {
                'description': 'User not found',
                'examples': {
                    'application/json': {'msg': 'User not found'}
                }
            },
            403: {
                'description': 'Admin access required',
                'examples': {
                    'application/json': {'msg': 'Admin access required'}
                }
            }
        },
        'parameters': [
            {
                'name': 'user_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the user to delete'
            }
        ]
    })
    @jwt_required()
    def delete(self, user_id):
        current_user = get_jwt_identity()
        if current_user['role'] != 0:
            return {"msg": "Admin access required"}, 403

        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        db.session.delete(user)
        db.session.commit()
        return {"msg": "User deleted successfully"}, 200
