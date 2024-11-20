import datetime
from flasgger import swag_from
from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from models.AvailableSlot import AvailableSlot
from models.database import db

# GET all Slots, POST Slot, PUT Slot, DELETE Slot
available_slot_parser = reqparse.RequestParser()
available_slot_parser.add_argument('cat_id', required=True, help="Cat ID cannot be blank.")
available_slot_parser.add_argument('start_time', required=True, help="Start time cannot be blank.")
available_slot_parser.add_argument('end_time', required=True, help="End time cannot be blank.")

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
            }
        }
    })
    def get(self):
        available_slots = AvailableSlot.query.all()
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
    def post(self):
        args = available_slot_parser.parse_args()
        new_slot = AvailableSlot(
            StartTime=args['start_time'],
            EndTime=args['end_time'],
            CatId=args['cat_id'],
            Status=0 # add an enum for status later
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
    def put(self, slot_id):
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
            }
        }
    })
    def delete(self, slot_id):
        slot = AvailableSlot.query.filter_by(Id=slot_id).first()
        if slot is None:
            return {'msg': 'Slot not found'}, 404
        db.session.delete(slot)
        db.session.commit()
        return {'msg': 'Available slot deleted successfully'}, 200