from flasgger import swag_from
from flask import jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, reqparse
from models.AvailableSlot import AvailableSlot
from models.Enums import AvailableSlotStatus, Roles
from models.database import db

available_slot_parser = reqparse.RequestParser()
available_slot_parser.add_argument('cat_id', required=True, help="Cat ID cannot be blank.")
available_slot_parser.add_argument('start_time', required=True, help="Start time cannot be blank.")
available_slot_parser.add_argument('end_time', required=True, help="End time cannot be blank.")

allowed_roles = [Roles.ADMIN.value, Roles.VERIFIED_VOLUNTEER.value, Roles.CAREGIVER.value]

class AvailableSlotList(Resource):
    @swag_from({
        'tags': ['Available Slots'],
        'summary': 'Get all available slots',
        'responses': {
            200: {
                'description': 'Successfully retrieved all available slots',
                'examples': {
                    'application/json': [
                        {
                            'id': 1,
                            'cat_id': 1,
                            'start_time': '2021-01-01 08:00:00',
                            'end_time': '2021-01-01 09:00:00',
                        }
                    ]
                }
            },
            401: {
                'description': 'Unauthorized user',
                'examples': {
                    'application/json': {'msg': 'Unauthorized user'}
                }
            }
        }
    })
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return make_response(jsonify({'msg': 'Unauthorized user'}), 401)
        
        available_slots = AvailableSlot.query.filter_by(Status=AvailableSlotStatus.AVAILABLE.value).all()
        available_slots_list = [
            {
                'id': available_slot.Id,
                'cat_id': available_slot.CatId,
                'start_time': available_slot.StartTime.strftime('%Y-%m-%d %H:%M'),
                'end_time': available_slot.EndTime.strftime('%Y-%m-%d %H:%M'),
            }
            for available_slot in available_slots
        ]
        return jsonify(available_slots_list)

    @swag_from({
        'tags': ['Available Slots'],
        'summary': 'Create a new available slot',
        'responses': {
            201: {
                'description': 'Available slot created successfully',
                'examples': {
                    'application/json': {'msg': 'Available slot created successfully'}
                }
            },
            400: {
                'description': 'Bad request',
                'examples': {
                    'application/json': {'msg': 'Bad request'}
                }
            },
            401: {
                'description': 'Unauthorized user',
                'examples': {
                    'application/json': {'msg': 'Unauthorized user'}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'description': 'JSON object representing the available slot',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'cat_id': {
                            'type': 'integer',
                            'example': 1
                        },
                        'start_time': {
                            'type': 'datetime',
                            'example': '2021-01-01 08:00:00'
                        },
                        'end_time': {
                            'type': 'datetime',
                            'example': '2021-01-01 09:00:00'
                        }
                    }
                }

            }
        ]
    })
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value]:
            return {'msg': 'Unauthorized user'}, 401
        
        args = available_slot_parser.parse_args()
        new_slot = AvailableSlot(
            StartTime = args['start_time'],
            EndTime = args['end_time'],
            CatId  = args['cat_id'],
            Status = AvailableSlotStatus.AVAILABLE.value
        )
        db.session.add(new_slot)
        db.session.commit()
        return {'msg': 'Available slot created successfully'}, 201
    
class AvailableSlotById(Resource):
    @swag_from({
        'tags': ['Available Slots'],
        'summary': 'Update an available slot',
        'responses': {
            200: {
                'description': 'Available slot updated successfully',
                'examples': {
                    'application/json': {'msg': 'Available slot updated successfully'}
                }
            },
            400: {
                'description': 'Bad request',
                'examples': {
                    'application/json': {'msg': 'Bad request'}
                }
            },
            401: {
                'description': 'Unauthorized user',
                'examples': {
                    'application/json': {'msg': 'Unauthorized user'}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'description': 'JSON object representing the available slot',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'cat_id': {
                            'type': 'integer',
                            'example': 1
                        },
                        'start_time': {
                            'type': 'datetime',
                            'example': '2021-01-01 08:00:00'
                        },
                        'end_time': {
                            'type': 'datetime',
                            'example': '2021-01-01 09:00:00'
                        }
                    }
                }

            }
        ]
    })
    @jwt_required()
    def put(self, slot_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return {'msg': 'Unauthorized user'}, 401
        
        args = available_slot_parser.parse_args()
        slot = AvailableSlot.query.filter_by(Id=slot_id).first()
        if slot is None:
            return {'msg': 'Slot not found'}, 404
        slot.CatId = args['cat_id']
        slot.StartTime = args['start_time']
        slot.EndTime = args['end_time']

        db.session.commit()
        return {'msg': 'Available slot updated successfully'}, 200

    @swag_from({
        'tags': ['Available Slots'],
        'summary': 'Delete an available slot',
        'responses': {
            200: {
                'description': 'Available slot deleted successfully',
                'examples': {
                    'application/json': {'msg': 'Available slot deleted successfully'}
                }
            },
            404: {
                'description': 'Slot not found',
                'examples': {
                    'application/json': {'msg': 'Slot not found'}
                }
            },
            401: {
                'description': 'Unauthorized user',
                'examples': {
                    'application/json': {'msg': 'Unauthorized user'}
                }
            }
        }
    })
    @jwt_required()
    def delete(self, slot_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value]:
            return {'msg': 'Unauthorized user'}, 401
        
        slot = AvailableSlot.query.filter_by(Id=slot_id).first()
        if slot is None:
            return {'msg': 'Slot not found'}, 404
        db.session.delete(slot)
        db.session.commit()
        return {'msg': 'Available slot deleted successfully'}, 200
    