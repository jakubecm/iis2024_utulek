from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash
from flasgger import swag_from
from models.User import User, Veterinarian, Volunteer
from models.Enums import Roles
from models.database import db

class UserById(Resource):
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
            401: {
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
        if current_user['role'] != Roles.ADMIN.value:
            return {"msg": "Admin access required"}, 401

        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        db.session.delete(user)
        db.session.commit()
        return {"msg": "User deleted successfully"}, 200
    
    @swag_from({
        'tags': ['Admin'],
        'summary': 'Edit a user by ID (Admin only)',
        'responses': {
            200: {
                'description': 'User updated successfully',
                'examples': {
                    'application/json': {'msg': 'User updated successfully'}
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
                'description': 'ID of the user to edit'
            }
        ]
    })
    @jwt_required()
    def put(self, user_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value]:
            return {"msg": "Admin access required"}, 403

        user = User.query.get(user_id)
        if not user:
            return {"msg": "User not found"}, 404

        # Parse input data
        parser = reqparse.RequestParser()
        parser.add_argument('Username', type=str, required=False)
        parser.add_argument('FirstName', type=str, required=False)
        parser.add_argument('LastName', type=str, required=False)
        parser.add_argument('Email', type=str, required=False)
        parser.add_argument('role', type=int, required=False)
        parser.add_argument('Specialization', type=str, required=False)
        parser.add_argument('Telephone', type=str, required=False)
        parser.add_argument('verified', type=bool, required=False)
        args = parser.parse_args()

        # Update veterinarian-specific fields if the user is a vet
        if user.role == Roles.VETS.value:
            # Retrieve or create the Veterinarian entry
            veterinarian = Veterinarian.query.filter_by(UserId=user.Id).first()
            if not veterinarian:
                veterinarian = Veterinarian(UserId=user.Id)
                db.session.add(veterinarian)
            
            # Update Specialization and Telephone if provided
            if args['Specialization'] is not None:
                veterinarian.Specialization = args['Specialization']
            if args['Telephone'] is not None:
                veterinarian.Telephone = args['Telephone']

        # Update volunteer-specific fields if applicable
        if user.role == Roles.VOLUNTEER.value and args['verified'] is not None:
            volunteer = Volunteer.query.filter_by(UserId=user.Id).first()
            if not volunteer:
                volunteer = Volunteer(UserId=user.Id)
                db.session.add(volunteer)
            volunteer.verified = args['verified']

        # Update user fields if provided
        if args['Username']:
            user.Username = args['Username']
        if args['FirstName']:
            user.FirstName = args['FirstName']
        if args['LastName']:
            user.LastName = args['LastName']
        if args['Email']:
            user.Email = args['Email']
        if args['role'] is not None:
            user.role = args['role']

        # Commit changes to the database
        db.session.commit()
        return {"msg": "User updated successfully"}, 200

class UserList(Resource):
    @swag_from({
        'tags': ['Admin'],
        'summary': 'Retrieve all users (Admin only)',
        'responses': {
            200: {
                'description': 'List of all users retrieved successfully',
                'examples': {
                    'application/json': [
                        {
                            'Id': 1,
                            'Username': 'johndoe',
                            'FirstName': 'John',
                            'LastName': 'Doe',
                            'Email': 'johndoe@example.com',
                            'role': 1,
                            'Veterinarian': {'Specialization': 'Surgery', 'Telephone': '123-456-7890'},
                            'Volunteer': {'verified': True}
                        },
                        {
                            'Id': 2,
                            'Username': 'janedoe',
                            'FirstName': 'Jane',
                            'LastName': 'Doe',
                            'Email': 'janedoe@example.com',
                            'role': 2,
                        }
                    ]
                }
            },
            401: {
                'description': 'Admin access required',
                'examples': {
                    'application/json': {'msg': 'Admin access required'}
                }
            }
        }
    })
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user['role'] != Roles.ADMIN.value:
            return {"msg": "Admin access required"}, 401

        # Retrieve all users
        users = User.query.all()
        users_data = []

        for user in users:
            user_data = {
                "Id": user.Id,
                "Username": user.Username,
                "FirstName": user.FirstName,
                "LastName": user.LastName,
                "Email": user.Email,
                "role": user.role,
            }

            # Check if the user is a veterinarian
            veterinarian = Veterinarian.query.filter_by(UserId=user.Id).first()
            if veterinarian:
                user_data["Specialization"] = veterinarian.Specialization
                user_data["Telephone"] = veterinarian.Telephone
            # Check if the user is a volunteer
            volunteer = Volunteer.query.filter_by(UserId=user.Id).first()
            if volunteer:
                user_data["verified"] = volunteer.verified

            users_data.append(user_data)

        return users_data, 200

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
            401: {
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
                        'role': {'type': 'integer', 'default': 1, 'description': 'Role of the user (1: Volunteer, 2: Veterinarian)'},
                        'specialization': {'type': 'string', 'description': 'Specialization of the veterinarian, required if role is 2'},
                        'telephone': {'type': 'string', 'description': 'Telephone of the veterinarian, required if role is 2'},
                        'verified': {'type': 'boolean', 'description': 'Verification status of the volunteer, required if role is 1'}
                    },
                    'required': ['username', 'email', 'password', 'role']
                },
                'description': 'JSON object with user data including optional fields for specific roles'
            }
        ]
    })
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user['role'] != Roles.ADMIN.value:
            return {"msg": "Admin access required"}, 401

        parser = reqparse.RequestParser()
        parser.add_argument('username', required=True, help="Username cannot be blank.")
        parser.add_argument('email', required=True, help="Email cannot be blank.")
        parser.add_argument('password', required=True, help="Password cannot be blank.")
        parser.add_argument('first_name', required=True, help="First name cannot be blank.")
        parser.add_argument('last_name', required=True, help="Last name cannot be blank.")
        parser.add_argument('role', type=int, required=True, help="Role is required.")
        parser.add_argument('Specialization', type=str, required=False)
        parser.add_argument('Telephone', type=str, required=False)
        parser.add_argument('verified', type=bool, required=False)
        args = parser.parse_args()

        if User.query.filter_by(Username=args['username']).first():
            return {"msg": "Username already exists"}, 409

        hashed_password = generate_password_hash(args['password'])
        new_user = User(
            Username=args['username'],
            Email=args['email'],
            FirstName=args['first_name'],
            LastName=args['last_name'],
            Hashed_pass=hashed_password,
            role=args['role']
        )

        if args['verified'] is True:
            new_user.role = Roles.VERIFIED_VOLUNTEER.value
            
        db.session.add(new_user)
        db.session.flush()  # Flush to get the user ID for foreign key references

        # Handle role-specific data
        if args['role'] == Roles.VETS.value:
            if not args['Specialization'] or not args['Telephone']:
                return {"msg": "Specialization and Telephone are required for veterinarians"}, 400
            veterinarian = Veterinarian(
                UserId=new_user.Id,
                Specialization=args['Specialization'],
                Telephone=args['Telephone']
            )
            db.session.add(veterinarian)

        elif args['role'] == Roles.VOLUNTEER.value:  # Volunteer
            if args['verified'] is None:
                return {"msg": "Verified status is required for volunteers"}, 400
            volunteer = Volunteer(
                UserId=new_user.Id,
                verified=args['verified']
            )
            db.session.add(volunteer)

        db.session.commit()
        return {"msg": "User created successfully"}, 201

class UnverifiedVolunteers(Resource):
    @swag_from({
        'tags': ['Admin'],
        'summary': 'Retrieve all unverified volunteers (Admin and caregiver only)',
        'responses': {
            200: {
                'description': 'List of all unverified volunteers retrieved successfully',
                'examples': {
                    'application/json': [
                        {
                            'Id': 1,
                            'Username': 'johndoe',
                            'FirstName': 'John',
                            'LastName': 'Doe',
                            'Email': 'johndoe@example.com',
                            'role': 1,
                            'verified': False
                        },
                    ]
                }
            },
            403: {
                'description': 'Admin access required',
                'examples': {
                    'application/json': {'msg': 'Admin access required'}
                }
            }
        }
    })
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value]:
            return {"msg": "Admin or caregiver access required"}, 403

        volunteers = User.query.join(Volunteer, User.Id == Volunteer.UserId).filter(Volunteer.verified == False).all()
        volunteers_data = []

        for volunteer in volunteers:
            volunteer_data = {
                "Id": volunteer.Id,
                "Username": volunteer.Username,
                "FirstName": volunteer.FirstName,
                "LastName": volunteer.LastName,
                "Email": volunteer.Email,
                "role": volunteer.role,
                "verified": volunteer.volunteer.verified
            }
            volunteers_data.append(volunteer_data)

        return volunteers_data, 200