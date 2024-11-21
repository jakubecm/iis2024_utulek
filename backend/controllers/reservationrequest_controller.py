from flasgger import swag_from
from flask import jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, reqparse
from models.Enums import AvailableSlotStatus, Roles
from models.ReservationRequest import ReservationRequest
from models.AvailableSlot import AvailableSlot
from models.database import db

parser = reqparse.RequestParser()
parser.add_argument('SlotId', type=int, required=True)
parser.add_argument('VolunteerId', type=int, required=True)
parser.add_argument('RequestDate', type=str, required=True)

allowed_roles = [Roles.ADMIN.value, Roles.VERIFIED_VOLUNTEER.value]

class ReservationList(Resource):
    @swag_from({
        'tags': ['Reservation Requests'],
        'summary': 'Get all reservation requests',
        'responses': {
            200: {
                'description': 'Successfully retrieved all reservation requests',
                'examples': {
                    'application/json': [
                        {
                            'id': 1,
                            'slot_id': 1,
                            'volunteer_id': 1,
                            'request_date': '2021-01-01',
                            'status': 1
                        }
                    ]
                }
            },
            401: {
                'description': 'Unauthorized access',
                'examples': {
                    'application/json': {'msg': 'Unauthorized access'}
                }
            }
        }
    })
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return {"msg": "Unauthorized access"}, 401
        
        reservation_requests = ReservationRequest.query.all()
        reservation_request_list = [
            {
                'id': rr.Id,
                'slot_id': rr.SlotId,
                'volunteer_id': rr.VolunteerId,
                'request_date': rr.RequestDate.strftime('%Y-%m-%d'),
                'status': rr.Status
            }
            for rr in reservation_requests
        ]
        return jsonify(reservation_request_list)

    @swag_from({
        'tags': ['Reservation Requests'],
        'summary': 'Create a new reservation request',
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
            },
            401: {
                'description': 'Unauthorized access',
                'examples': {
                    'application/json': {'msg': 'Unauthorized access'}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'SlotId': {'type': 'integer'},
                        'VolunteerId': {'type': 'integer'},
                        'RequestDate': {'type': 'string'},
                    }
                }
            }
        ]
    })
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return {"msg": "Unauthorized access"}, 401
        
        args = parser.parse_args()
        new_reservation_request = ReservationRequest(
            SlotId=args['SlotId'],
            VolunteerId=args['VolunteerId'],
            RequestDate=args['RequestDate'],
            Status=0 # add an enum later
        )
        db.session.add(new_reservation_request)

        # Update the slot status to reserved
        slot = AvailableSlot.query.filter_by(Id=args['SlotId']).first()
        if slot is None:
            return {"msg": "Invalid data provided"}, 400
        slot.Status = AvailableSlotStatus.RESERVED.value
        
        db.session.commit()
        return {"msg": "Reservation request created successfully"}, 201
    
class ReservationById(Resource):
    @swag_from({
        'tags': ['Reservation Requests'],
        'summary': 'Get specific reservation request by ID',
        'responses': {
            200: {
                'description': 'Successfully retrieved reservation request by ID',
                'examples': {
                    'application/json': {
                        'id': 1,
                        'slot_id': 1,
                        'volunteer_id': 1,
                        'request_date': '2021-01-01',
                        'status': 1
                    }
                }
            },
            404: {
                'description': 'Reservation request not found',
                'examples': {
                    'application/json': {'msg': 'Reservation request not found'}
                }
            },
            401: {
                'description': 'Unauthorized access',
                'examples': {
                    'application/json': {'msg': 'Unauthorized access'}
                }
            }
        },
        'parameters': [
            {
                'name': 'reservation_request_id',
                'in': 'path',
                'type': 'integer',
                'required': True
            }
        ]
    })
    @jwt_required()
    def get(self, reservation_request_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return {"msg": "Unauthorized access"}, 401
        
        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()
        
        if reservation_request is None:
            return {"msg": "Reservation request not found"}, 404
        
        return {
            'id': reservation_request.Id,
            'slot_id': reservation_request.SlotId,
            'volunteer_id': reservation_request.VolunteerId,
            'request_date': reservation_request.RequestDate.strftime('%Y-%m-%d'),
            'status': reservation_request.Status
        }

    @swag_from({
        'tags': ['Reservation Requests'],
        'summary': 'Delete specific reservation request by ID',
        'responses': {
            200: {
                'description': 'Successfully deleted reservation request by ID',
                'examples': {
                    'application/json': {
                        'msg': 'Reservation request deleted successfully'
                    }
                }
            },
            404: {
                'description': 'Reservation request not found',
                'examples': {
                    'application/json': {
                        'msg': 'Reservation request not found'
                    }
                }
            },
            401: {
                'description': 'Unauthorized access',
                'examples': {
                    'application/json': {
                        'msg': 'Unauthorized access'
                    }
                }
            }
        }
    })
    @jwt_required()
    def delete(self, reservation_request_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in allowed_roles:
            return {"msg": "Unauthorized access"}, 401
        
        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()

        if reservation_request is None:
            return {"msg": "Reservation request not found"}, 404

        # Update the slot status to available
        slot = AvailableSlot.query.filter_by(Id=reservation_request.SlotId).first()
        if slot is None:
            return {"msg": "Invalid data provided"}, 400
        slot.Status = AvailableSlotStatus.AVAILABLE.value
        
        db.session.delete(reservation_request)
        db.session.commit()
        return {"msg": "Reservation request deleted successfully"}, 200

    @swag_from({
        'tags': ['Reservation Requests'],
        'summary': 'Update a reservation request by ID',
        'responses': {
            200: {
                'description': 'Successfully updated reservation request by ID',
                'examples': {
                    'application/json': {
                        'msg': 'Reservation request updated successfully'
                    }
                }
            },
            400: {
                'description': 'Bad request',
                'examples': {
                    'application/json': {
                        'msg': 'Invalid data provided'
                    }
                }
            },
            404: {
                'description': 'Reservation request not found',
                'examples': {
                    'application/json': {
                        'msg': 'Reservation request not found'
                    }
                }
            },
            401: {
                'description': 'Unauthorized access',
                'examples': {
                    'application/json': {
                        'msg': 'Unauthorized access'
                    }
                }
            }
        },
        'parameters': [
            {
                'name': 'reservation_request_id',
                'in': 'path',
                'type': 'integer',
                'required': True
            },
            {
                'name': 'body',
                'in': 'body',
                'schema': {
                    'type': 'object',
                    'properties': {
                        'Status': {'type': 'integer'}
                    }
                }
            }
        ]
    })
    @jwt_required()
    def put(self, reservation_request_id):
        current_user = get_jwt_identity()
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value]:
            return {"msg": "Unauthorized access"}, 401
        # parse only the Status field
        put_parser = reqparse.RequestParser()
        put_parser.add_argument('Status', type=int, required=True)
        put_args = put_parser.parse_args()

        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()
        reservation_request.Status = put_args['Status']
        db.session.commit()
        return {"msg": "Reservation request updated successfully"}, 200

