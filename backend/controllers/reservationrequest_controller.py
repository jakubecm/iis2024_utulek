from flasgger import swag_from
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from flask_restful import Resource, reqparse
from models.User import User
from models.Cat import Cats
from models.Enums import AvailableSlotStatus, Roles, Status, WalkRequestStatus
from models.ReservationRequest import ReservationRequest
from models.AvailableSlot import AvailableSlot
from models.database import db
from sqlalchemy import desc

parser = reqparse.RequestParser()
parser.add_argument('SlotId', type=int, required=True)
parser.add_argument('VolunteerId', type=int, required=True)
parser.add_argument('RequestDate', type=str, required=True)

allowed_roles = [Roles.ADMIN.value, Roles.VERIFIED_VOLUNTEER.value, Roles.CAREGIVER.value]

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
        # Check whether a reservation for the same slot and volunteer already exists
        existing_reservation = ReservationRequest.query.filter_by(SlotId=args['SlotId'], VolunteerId=args['VolunteerId']).first()
        if existing_reservation is not None:
            return {"msg": "Reservation request already exists"}, 400
        
        new_reservation_request = ReservationRequest(
            SlotId=args['SlotId'],
            VolunteerId=args['VolunteerId'],
            RequestDate=args['RequestDate'],
            Status=WalkRequestStatus.PENDING.value
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
        if current_user['role'] not in [Roles.ADMIN.value, Roles.CAREGIVER.value, Roles.VERIFIED_VOLUNTEER.value]:
            return {"msg": "Unauthorized access"}, 401
        # parse only the Status field
        put_parser = reqparse.RequestParser()
        put_parser.add_argument('Status', type=int, required=True)
        put_args = put_parser.parse_args()

        reservation_request = ReservationRequest.query.filter_by(Id=reservation_request_id).first()
        reservation_request.Status = put_args['Status']

        # Update the slot status to available if the reservation is rejected
        if put_args['Status'] == WalkRequestStatus.REJECTED.value or put_args['Status'] == WalkRequestStatus.CANCELLED.value:
            slot = AvailableSlot.query.filter_by(Id=reservation_request.SlotId).first()
            if slot is None:
                return {"msg": "Invalid data provided"}, 400
            slot.Status = AvailableSlotStatus.AVAILABLE.value

        db.session.commit()
        return {"msg": "Reservation request updated successfully"}, 200

class ReservationOverview(Resource):
    @swag_from({
        'tags': ['Reservations'],
        'summary': 'Get a detailed list of reservations for caregiver approval or for a specific user',
        'parameters': [
            {
                'name': 'user_id',
                'in': 'query',
                'type': 'integer',
                'required': False,
                'description': 'Optional user ID to filter reservations for a specific user',
            },
        ],
        'responses': {
            200: {
                'description': 'Successfully retrieved reservations overview',
                'examples': {
                    'application/json': [
                        {
                            "reservation_id": 1,
                            "volunteer_username": "john_doe",
                            "volunteer_full_name": "John Doe",
                            "cat_name": "Whiskers",
                            "start_time": "2024-11-25 10:00",
                            "end_time": "2024-11-25 11:00",
                            "reservation_status": "Pending"
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

        # Get the optional user_id from query parameters
        user_id = request.args.get('user_id', type=int)

        # Base query
        query = db.session.query(
            ReservationRequest.Id.label('reservation_id'),
            User.Username.label('volunteer_username'),
            db.func.concat(User.FirstName, ' ', User.LastName).label('volunteer_full_name'),
            User.Email.label('volunteer_email'),
            Cats.Name.label('cat_name'),
            Cats.Id.label('cat_id'),
            AvailableSlot.Id.label('slot_id'),
            AvailableSlot.StartTime.label('start_time'),
            AvailableSlot.EndTime.label('end_time'),
            ReservationRequest.Status.label('reservation_status')
        ).join(
            User, User.Id == ReservationRequest.VolunteerId
        ).join(
            AvailableSlot, AvailableSlot.Id == ReservationRequest.SlotId
        ).join(
            Cats, Cats.Id == AvailableSlot.CatId
        )

        # Apply filters based on user_id and status
        if user_id:
            query = query.filter(ReservationRequest.VolunteerId == user_id)
        else:
            query = query.filter(ReservationRequest.Status == WalkRequestStatus.PENDING.value)

        # Execute the query
        reservations = query.order_by(
            AvailableSlot.StartTime.desc()  # Sort by start time
        ).all()

        # Format the response
        reservations_list = [
            {
                "reservation_id": r.reservation_id,
                "volunteer_username": r.volunteer_username,
                "volunteer_full_name": r.volunteer_full_name,
                "volunteer_email": r.volunteer_email,
                "cat_id": r.cat_id,
                "cat_name": r.cat_name,
                "slot_id": r.slot_id,
                "start_time": r.start_time.strftime('%Y-%m-%d %H:%M'),
                "end_time": r.end_time.strftime('%Y-%m-%d %H:%M'),
                "reservation_status": r.reservation_status
            }
            for r in reservations
        ]

        return jsonify(reservations_list)


class ReservationOverviewOngoing(Resource):
    @swag_from({
        'tags': ['Reservations'],
        'summary': 'Get a sorted list of ongoing reservations by start time',
        'responses': {
            200: {
                'description': 'Successfully retrieved and sorted reservations',
                'examples': {
                    'application/json': [
                        {
                            "reservation_id": 1,
                            "volunteer_username": "john_doe",
                            "volunteer_full_name": "John Doe",
                            "cat_name": "Whiskers",
                            "start_time": "2024-11-25 10:00",
                            "end_time": "2024-11-25 11:00",
                            "reservation_status": "Pending"
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

        # Query the database and sort by AvailableSlot.StartTime
        reservations = db.session.query(
            ReservationRequest.Id.label('reservation_id'),
            User.Username.label('volunteer_username'),
            db.func.concat(User.FirstName, ' ', User.LastName).label('volunteer_full_name'),
            Cats.Name.label('cat_name'),
            AvailableSlot.StartTime.label('start_time'),
            AvailableSlot.EndTime.label('end_time'),
            AvailableSlot.Id.label('slot_id'),
            ReservationRequest.Status.label('reservation_status')
        ).join(
            User, User.Id == ReservationRequest.VolunteerId
        ).join(
            AvailableSlot, AvailableSlot.Id == ReservationRequest.SlotId
        ).join(
            Cats, Cats.Id == AvailableSlot.CatId
         ).filter(
            ReservationRequest.Status.in_([WalkRequestStatus.APPROVED.value, WalkRequestStatus.IN_PROGRESS.value, WalkRequestStatus.PENDING.value])  # Filter by status 2 or 3
        ).order_by(
            AvailableSlot.StartTime  # Sort by start time
        ).all()

        # Format the response
        reservations_list = [
            {
                "reservation_id": r.reservation_id,
                "volunteer_username": r.volunteer_username,
                "volunteer_full_name": r.volunteer_full_name,
                "cat_name": r.cat_name,
                "start_time": r.start_time.strftime('%Y-%m-%d %H:%M'),
                "end_time": r.end_time.strftime('%Y-%m-%d %H:%M'),
                "reservation_status": r.reservation_status,
                "slot_id": r.slot_id
            }
            for r in reservations
        ]

        return jsonify(reservations_list)
    
class ReservationOverviewSorted(Resource):
    @swag_from({
        'tags': ['Reservations'],
        'summary': 'Get a sorted list of concluded reservations by start time',
        'responses': {
            200: {
                'description': 'Successfully retrieved and sorted reservations',
                'examples': {
                    'application/json': [
                        {
                            "reservation_id": 1,
                            "volunteer_username": "john_doe",
                            "volunteer_full_name": "John Doe",
                            "cat_name": "Whiskers",
                            "start_time": "2024-11-25 10:00",
                            "end_time": "2024-11-25 11:00",
                            "reservation_status": "Pending"
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

        # Query the database and sort by AvailableSlot.StartTime
        reservations = db.session.query(
            ReservationRequest.Id.label('reservation_id'),
            User.Username.label('volunteer_username'),
            db.func.concat(User.FirstName, ' ', User.LastName).label('volunteer_full_name'),
            Cats.Name.label('cat_name'),
            AvailableSlot.StartTime.label('start_time'),
            AvailableSlot.EndTime.label('end_time'),
            AvailableSlot.Id.label('slot_id'),
            ReservationRequest.Status.label('reservation_status')
        ).join(
            User, User.Id == ReservationRequest.VolunteerId
        ).join(
            AvailableSlot, AvailableSlot.Id == ReservationRequest.SlotId
        ).join(
            Cats, Cats.Id == AvailableSlot.CatId
         ).filter(
            ~ReservationRequest.Status.in_([WalkRequestStatus.APPROVED.value, WalkRequestStatus.IN_PROGRESS.value, WalkRequestStatus.PENDING.value])  # Filter by status 2 or 3
        ).order_by(
            AvailableSlot.StartTime.desc()  # Sort by start time
        ).all()

        # Format the response
        reservations_list = [
            {
                "reservation_id": r.reservation_id,
                "volunteer_username": r.volunteer_username,
                "volunteer_full_name": r.volunteer_full_name,
                "cat_name": r.cat_name,
                "start_time": r.start_time.strftime('%Y-%m-%d %H:%M'),
                "end_time": r.end_time.strftime('%Y-%m-%d %H:%M'),
                "reservation_status": r.reservation_status,
                "slot_id": r.slot_id
            }
            for r in reservations
        ]

        return jsonify(reservations_list)
