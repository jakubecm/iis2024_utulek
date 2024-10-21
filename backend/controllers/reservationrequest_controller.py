from flasgger import swag_from
from flask import jsonify
from flask_restful import Resource, reqparse
from models.ReservationRequest import ReservationRequest
from models.database import db

parser = reqparse.RequestParser()
parser.add_argument('SlotId', type=int, required=True)
parser.add_argument('VolunteerId', type=int, required=True)
parser.add_argument('RequestDate', type=str, required=True)

# Get all reservation requests, get a specific reservation request, create a new reservation request, delete a reservation request
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
            }
        }
    })
    def get(self):
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
    def post(self):
        args = parser.parse_args()
        new_reservation_request = ReservationRequest(
            SlotId=args['SlotId'],
            VolunteerId=args['VolunteerId'],
            RequestDate=args['RequestDate'],
            Status=0 # add an enum later
        )
        db.session.add(new_reservation_request)
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
    def get(self, reservation_request_id):
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
            }
        }
    })
    def delete(self, reservation_request_id):
        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()
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
    def put(self, reservation_request_id):
        # parse only the Status field
        put_parser = reqparse.RequestParser()
        put_parser.add_argument('Status', type=int, required=True)
        put_args = put_parser.parse_args()

        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()
        reservation_request.Status = put_args['Status']
        db.session.commit()
        return {"msg": "Reservation request updated successfully"}, 200

