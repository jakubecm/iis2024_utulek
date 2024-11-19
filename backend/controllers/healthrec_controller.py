from flasgger import swag_from
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, reqparse
from models.Enums import Roles
from models.HealthRecord import HealthRecord
from models.database import db
from models.User import User

health_record_parser = reqparse.RequestParser()
health_record_parser.add_argument('date', type=str, required=True, help="Date cannot be blank.")
health_record_parser.add_argument('description', type=str, required=True, help="Description cannot be blank.")
# health_record_parser.add_argument('vet_id', type=int, required=True, help="Vet ID cannot be blank.")

class HealthRecordList(Resource):
    @swag_from({
        'tags': ['Health Records'],
        'summary': 'Get all health records for a specific cat by cat ID',
        'responses': {
            200: {
                'description': 'Successfully retrieved all health records',
                'examples': {
                    'application/json': [
                        {
                            'id': 1,
                            'cat_id': 1,
                            'date': '2021-01-01',
                            'description': 'Cat has a cold',
                            'vet_name': 'Dr. John Doe'
                        }
                    ]
                }
            }
        },
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'path',
                'type': 'integer',
                'description': 'Cat ID'
            }
        ]
    })
    def get(self, cat_id):
        # Fetch health records with joined vet info
        health_records = (
            db.session.query(HealthRecord, User)
            .join(User, HealthRecord.VetId == User.Id)  # Join with the User table
            .filter(HealthRecord.CatId == cat_id)
            .all()
        )
        
        health_record_list = [
            {
                'id': hr.HealthRecord.Id,
                'cat_id': hr.HealthRecord.CatId,
                'date': hr.HealthRecord.Date.strftime('%Y-%m-%d'),
                'description': hr.HealthRecord.Description,
                'vet_name': f"{hr.User.FirstName} {hr.User.LastName}"  # Combine first and last names
            }
            for hr in health_records
        ]
        return jsonify(health_record_list)

    @swag_from({
        'tags': ['Health Records'],
        'summary': 'Create a new health record',
        'responses': {
            201: {
                'description': 'Health record created successfully',
                'examples': {
                    'application/json': {'msg': 'Health record created successfully'}
                }
            },
            400: {
                'description': 'Bad request',
                'examples': {
                    'application/json': {'msg': 'Invalid data provided'}
                }
            }
        },
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'path',
                'type': 'integer',
                'description': 'Cat ID'
            },
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'date': {
                            'type': 'string',
                            'description': 'Date of health record'
                        },
                        'description': {
                            'type': 'string',
                            'description': 'Description of health record'
                        },
                        'vet_id': {
                            'type': 'integer',
                            'description': 'Vet ID'
                        }
                    }
                }
            }
        ]
    })
    @jwt_required()
    def post(self, cat_id): # Create a new health record
        current_user = get_jwt_identity()
        print(current_user)
        if current_user['role'] != Roles.ADMIN.value and current_user['role'] != Roles.VETS.value:
            return {"msg": "Unauthorized user"}, 401
        
        args = health_record_parser.parse_args()

        new_health_record = HealthRecord(
            CatId = cat_id,
            Date = args['date'],
            Description = args['description'],
            VetId = current_user['user_id']
        )

        db.session.add(new_health_record)
        db.session.commit()
        return {"msg": "Health record created successfully"}, 201
    
class HealthRecordById(Resource):
    @swag_from({
        'tags': ['Health Records'],
        'summary': 'Get specific health record by ID',
        'responses': {
            200: {
                'description': 'Successfully retrieved health record by ID',
                'examples': {
                    'application/json': {
                        'id': 1,
                        'cat_id': 1,
                        'date': '2021-01-01',
                        'description': 'Cat had a cold',
                        'vet_id': 1
                    }
                }
            },
            404: {
                'description': 'Health record not found',
                'examples': {
                    'application/json': {'msg': 'Health record not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'health_record_id',
                'in': 'path',
                'type': 'integer',
                'description': 'Health record ID'
            }
        ]
    })
    def get(self, health_record_id):
        health_record = HealthRecord.query.filter_by(Id=health_record_id).first()

        if health_record:
            data = {
                'id': health_record.Id,
                'cat_id': health_record.CatId,
                'date': health_record.Date.strftime('%Y-%m-%d'),
                'description': health_record.Description,
                'vet_id': health_record.VetId
            }
            return data, 200
        else:
            return {"msg": "Health record not found"}, 404

    @swag_from({
        'tags': ['Health Records'],
        'summary': 'Update a health record by ID',
        'responses': {
            200: {
                'description': 'Health record updated successfully',
                'examples': {
                    'application/json': {'msg': 'Health record updated successfully'}
                }
            },
            400: {
                'description': 'Bad request',
                'examples': {
                    'application/json': {'msg': 'Invalid data provided'}
                }
            }
        },
        'parameters': [
            {
                'name': 'health_record_id',
                'in': 'path',
                'type': 'integer',
                'description': 'Health record ID'
            },
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'cat_id': {
                            'type': 'integer',
                            'description': 'Cat ID'
                        },
                        'date': {
                            'type': 'string',
                            'description': 'Date of health record'
                        },
                        'description': {
                            'type': 'string',
                            'description': 'Description of health record'
                        },
                        'vet_id': {
                            'type': 'integer',
                            'description': 'Vet ID'
                        }
                    }
                }
            }
        ]
    })
    @jwt_required()
    def put(self, health_record_id):
        current_user = get_jwt_identity()
        if current_user['role'] != Roles.ADMIN.value and current_user['role'] != Roles.VETS.value:
            return {"msg": "Unauthorized user"}, 401
        
        args = health_record_parser.parse_args()
        data = request.get_json()

        health_record = HealthRecord.query.filter_by(Id=health_record_id).first()
        if health_record:
            health_record.CatId = data['cat_id']
            health_record.Date = args['date']
            health_record.Description = args['description']
            health_record.VetId = current_user['user_id']

            db.session.commit()
            return {"msg": "Health record updated successfully"}, 200
        else:
            return {"msg": "Health record not found"}, 404


