import datetime
from flasgger import swag_from
from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from models.ExaminationRequest import ExaminationRequest
from models.database import db

examination_request_parser = reqparse.RequestParser()
examination_request_parser.add_argument('cat_id', required=True, help="Cat ID cannot be blank.")
examination_request_parser.add_argument('caregiver_id', required=True, help="Caregiver ID cannot be blank.")
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
    def get(self):
        examination_requests = ExaminationRequest.query.all()
        examination_requests_list = [
            {
                'id': examination_request.Id,
                'cat_id': examination_request.CatId,
                'caregiver_id': examination_request.CaregiverId,
                'request_date': examination_request.RequestDate,
                'description': examination_request.Description,
                'status': examination_request.Status
            }
            for examination_request in examination_requests
        ]
        return jsonify(examination_requests_list)

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
    def post(self):
        args = examination_request_parser.parse_args()
        cat_id = args['cat_id']
        caregiver_id = args['caregiver_id']
        description = args['description']
        status = 0 # todo: make an enum for status
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
    def put(self, examination_request_id):
        examination_request = ExaminationRequest.query.filter_by(Id=examination_request_id).first()
        if examination_request:
            args = examination_request_parser.parse_args()
            cat_id = args['cat_id']
            caregiver_id = args['caregiver_id']
            description = args['description']
            examination_request.CatId = cat_id
            examination_request.CaregiverId = caregiver_id
            examination_request.Description = description
            db.session.commit()
            return {'msg': 'Examination request updated successfully'}, 200
        else:
            return {'msg': 'Examination request not found'}, 404
        
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
    def delete(self, examination_request_id):
        examination_request = ExaminationRequest.query.filter_by(Id=examination_request_id).first()
        if examination_request:
            db.session.delete(examination_request)
            db.session.commit()
            return {'msg': 'Examination request deleted successfully'}, 200
        else:
            return {'msg': 'Examination request not found'}, 404
        
