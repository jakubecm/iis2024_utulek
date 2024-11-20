import datetime
from flasgger import swag_from
from flask import jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_restful import Resource, reqparse
from models.ExaminationRequest import ExaminationRequest
from models.database import db
from models.Enums import Roles, Status
from models.Cat import Cats
from models.User import User

examination_request_parser = reqparse.RequestParser()
examination_request_parser.add_argument('cat_id', required=True, help="Cat ID cannot be blank.")
# request_date will be assigned on the server side
examination_request_parser.add_argument('description', required=True, help="Description cannot be blank.")
# status will be assigned on the server side

class ExaminationRequestList(Resource):
    @swag_from({
        'tags': ['Examination Requests'],
        'summary': 'Get all examination requests (for table display)',
        'responses': {
            200: {
                'description': 'Successfully retrieved all examination requests',
                'examples': {
                    'application/json': [
                        {
                            'cat_id': 1,
                            'caregiver_id': 1,
                            'description': 'A request for examination',
                        }
                    ]
                }
            }
        }
    })
    @jwt_required()
    def get(self):
        current_user = get_jwt_identity()
        role = current_user.get('role')
        user_id = current_user.get('user_id')

        # Filter requests based on role
        if role == Roles.CAREGIVER.value:
            # Fetch only requests made by the caregiver
            examination_requests = ExaminationRequest.query.filter_by(CaregiverId=user_id).all()
        else:
            # Fetch all requests for admins and vets
            examination_requests = ExaminationRequest.query.all()

        final_requests = []
        for req in examination_requests:
            cat = Cats.query.filter_by(Id=req.CatId).first()
            caregiver = User.query.filter_by(Id=req.CaregiverId).first()
            final_requests.append({
                'id': req.Id,
                'cat_name': cat.Name if cat else "Unknown Cat",
                'caregiver_name': f"{caregiver.FirstName} {caregiver.LastName}" if caregiver else "Unknown Caregiver",
                'request_date': req.RequestDate.strftime('%Y-%m-%d'),
                'description': req.Description,
                'status': req.Status,
            })

        return jsonify(final_requests)

    @swag_from({
        'tags': ['Examination Requests'],
        'summary': 'Create a new examination request',
        'responses': {
            201: {
                'description': 'Examination request created successfully',
                'examples': {
                    'application/json': {'msg': 'Examination request created successfully'}
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
                'description': 'Examination request data',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'cat_id': {'type': 'integer'},
                        'caregiver_id': {'type': 'integer'},
                        'description': {'type': 'string'}
                    }
                }
            }
        ]
    })
    @jwt_required()
    def post(self):
        current_user = get_jwt_identity()
        if current_user['role'] != Roles.CAREGIVER.value and current_user['role'] != Roles.ADMIN.value:
            return {'msg': 'Unauthorized'}, 401
        
        args = examination_request_parser.parse_args()
        cat_id = args['cat_id']
        caregiver_id = current_user['user_id']
        description = args['description']
        status = Status.PENDING.value
        request_date = datetime.date.today()
        examination_request = ExaminationRequest(CatId=cat_id, CaregiverId=caregiver_id, RequestDate=request_date, Description=description, Status=status)

        db.session.add(examination_request)
        db.session.commit()

        return {'msg': 'Examination request created successfully'}, 201
    

class ExaminationRequestById(Resource):
    @swag_from({
        'tags': ['Examination Requests'],
        'summary': 'Get examination request by ID',
        'parameters': [
            {
                'name': 'examination_request_id',
                'in': 'path',
                'type': 'integer',
                'required': True,
                'description': 'ID of the examination request'
            }
        ],
        'responses': {
            200: {
                'description': 'Successfully retrieved examination request',
                'examples': {
                    'application/json': {
                        'cat_id': 1,
                        'caregiver_id': 1,
                        'description': 'Rex has been acting strange lately and he won\'t eat his favorite treats, we think something is wrong.',
                    }
                }
            },
            404: {
                'description': 'Examination request not found',
                'examples': {
                    'application/json': {'msg': 'Examination request not found'}
                }
            }
        }
    })
    def get(self, examination_request_id):
        examination_request = ExaminationRequest.query.filter_by(Id=examination_request_id).first()
        if examination_request:
            return jsonify({
                'id': examination_request.Id,
                'cat_id': examination_request.CatId,
                'caregiver_id': examination_request.CaregiverId,
                'request_date': examination_request.RequestDate,
                'description': examination_request.Description,
                'status': examination_request.Status
            })
        else:
            return {'msg': 'Examination request not found'}, 404

    @swag_from({
        'tags': ['Examination Requests'],
        'summary': 'Update examination request',
        'parameters': [
            {
                'name': 'examination_request_id',
                'in': 'path',
                'type': 'integer',
                'required': True,
                'description': 'ID of the examination request'
            }
        ],
        'responses': {
            200: {
                'description': 'Examination request updated successfully',
                'examples': {
                    'application/json': {'msg': 'Examination request updated successfully'}
                }
            },
            404: {
                'description': 'Examination request not found',
                'examples': {
                    'application/json': {'msg': 'Examination request not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'body',
                'in': 'body',
                'description': 'Examination request data',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'cat_id': {'type': 'integer'},
                        'caregiver_id': {'type': 'integer'},
                        'description': {'type': 'string'}
                    }
                }
            }
        ]
    })
    @jwt_required()
    def put(self, examination_request_id):
        current_user = get_jwt_identity()
        role = current_user.get("role")
        user_id = current_user.get("user_id")

        # Fetch the examination request
        examination_request = ExaminationRequest.query.filter_by(Id=examination_request_id).first()
        if not examination_request:
            return {'msg': 'Examination request not found'}, 404

        data = request.get_json()

        if role == Roles.VETS.value:
            # Vets can only update the status field
            examination_request.Status = data.get('status', examination_request.Status)
        elif role in [Roles.CAREGIVER.value, Roles.ADMIN.value]:
            # Caregivers and Admins can edit all field
            examination_request.CatId = data.get('cat_id', examination_request.CatId)
            examination_request.Description = data.get('description', examination_request.Description)
            if role == Roles.CAREGIVER.value:
                examination_request.CaregiverId = user_id
            if role == Roles.ADMIN.value:
                examination_request.Status = data.get('status', examination_request.Status)
        else:
            return {'msg': 'Unauthorized'}, 403

        db.session.commit()
        return {'msg': 'Examination request updated successfully'}, 200

        
    @swag_from({
        'tags': ['Examination Requests'],
        'summary': 'Delete examination request',
        'parameters': [
            {
                'name': 'examination_request_id',
                'in': 'path',
                'type': 'integer',
                'required': True,
                'description': 'ID of the examination request'
            }
        ],
        'responses': {
            200: {
                'description': 'Examination request deleted successfully',
                'examples': {
                    'application/json': {'msg': 'Examination request deleted successfully'}
                }
            },
            404: {
                'description': 'Examination request not found',
                'examples': {
                    'application/json': {'msg': 'Examination request not found'}
                }
            }
        }
    })
    # Todo: fix delete endpoint
    def delete(self, examination_request_id):
        examination_request = ExaminationRequest.query.filter_by(Id=examination_request_id).first()
        if examination_request:
            db.session.delete(examination_request)
            db.session.commit()
            return {'msg': 'Examination request deleted successfully'}, 200
        else:
            return {'msg': 'Examination request not found'}, 404
        
