from flask import jsonify
from flask_restful import Resource, reqparse
from flasgger import swag_from
from models.Cat import Cats
from models.database import db

# Parser for Cat endpoints
cat_parser = reqparse.RequestParser()
cat_parser.add_argument('name', required=True, help="Name cannot be blank.")
cat_parser.add_argument('species_id', type=int, required=True, help="Species ID cannot be blank.")
cat_parser.add_argument('age', type=int, help="Age must be an integer.")
cat_parser.add_argument('description', help="Description cannot be blank.")
cat_parser.add_argument('found', help="Found date in format YYYY-MM-DD")

class CatList(Resource):
    @swag_from({
        'summary': 'Get all cats',
        'responses': {
            200: {
                'description': 'Successfully retrieved all cats',
                'examples': {
                    'application/json': [
                        {
                            'id': 1, 
                            'name': 'Whiskers', 
                            'species_id': 1, 'age': 5, 
                            'description': 'A playful cat', 
                            'found': '2024-01-01'
                            }
                    ]
                }
            }
        }
    })
    def get(self): # Get all cats
        cats = Cats.query.all()
        cats_list = [
            {
                'id': cat.Id,
                'name': cat.Name,
                'species_id': cat.SpeciesId,
                'age': cat.Age,
                'description': cat.Description,
                'found': cat.Found
            } 
            for cat in cats
        ]
        return jsonify(cats_list)

    @swag_from({
        'summary': 'Create a new cat',
        'responses': {
            201: {
                'description': 'Cat created successfully',
                'examples': {
                    'application/json': {'msg': 'Cat created successfully'}
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
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string'},
                        'species_id': {'type': 'integer'},
                        'age': {'type': 'integer'},
                        'description': {'type': 'string'},
                        'found': {'type': 'string', 'format': 'date', 'description': 'Date when the cat was found (YYYY-MM-DD)'}
                    },
                    'required': ['name', 'species_id']
                },
                'description': 'JSON object containing name, species ID, age, description, and found date'
            }
        ]
    })
    def post(self): # Create a new cat
        args = cat_parser.parse_args()
        new_cat = Cats(
            Name=args['name'],
            SpeciesId=args['species_id'],
            Age=args.get('age'),
            Description=args.get('description'),
            Found=args.get('found')
        )
        db.session.add(new_cat)
        db.session.commit()
        return {"msg": "Cat created successfully"}, 201

class CatById(Resource):
    @swag_from({
        'summary': 'Get specific cat by ID',
        'responses': {
            200: {
                'description': 'Successfully retrieved cat by ID',
                'examples': {
                    'application/json': {
                        'id': 1, 
                        'name': 'Whiskers', 
                        'species_id': 1, 
                        'age': 5, 
                        'description': 'A small cat', 
                        'found': '2024-01-01'
                    }
                }
            },
            404: {
                'description': 'Cat not found',
                'examples': {
                    'application/json': {'msg': 'Cat not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the cat to retrieve'
            }
        ]
    })
    def get(self, cat_id): # Get a cat by ID
        cat = Cats.query.get(cat_id)
        if not cat:
            return {"msg": "Cat not found"}, 404
        return jsonify({
            'id': cat.Id,
            'name': cat.Name,
            'species_id': cat.SpeciesId,
            'age': cat.Age,
            'description': cat.Description,
            'found': cat.Found
        })

    @swag_from({
        'summary': 'Update a specific cat by ID',
        'responses': {
            200: {
                'description': 'Cat updated successfully',
                'examples': {
                    'application/json': {'msg': 'Cat updated successfully'}
                }
            },
            404: {
                'description': 'Cat not found',
                'examples': {
                    'application/json': {'msg': 'Cat not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the cat to update'
            },
            {
                'name': 'body',
                'in': 'body',
                'required': True,
                'schema': {
                    'type': 'object',
                    'properties': {
                        'name': {'type': 'string'},
                        'species_id': {'type': 'integer'},
                        'age': {'type': 'integer'},
                        'description': {'type': 'string'},
                        'found': {'type': 'string', 'format': 'date', 'description': 'Date when the cat was found (YYYY-MM-DD)'}
                    }
                },
                'description': 'JSON object containing name, species ID, age, description, and found date'
            }
        ]
    })
    def put(self, cat_id): # Update a cat by ID
        cat = Cats.query.get(cat_id)
        if not cat:
            return {"msg": "Cat not found"}, 404

        args = cat_parser.parse_args()
        cat.Name = args['name']
        cat.SpeciesId = args['species_id']
        cat.Age = args.get('age')
        cat.Description = args.get('description')
        cat.Found = args.get('found')

        db.session.commit()
        return {"msg": "Cat updated successfully"}, 200

    @swag_from({
        'summary': 'Delete a specific cat by ID', 
        'responses': {
            200: {
                'description': 'Cat deleted successfully',
                'examples': {
                    'application/json': {'msg': 'Cat deleted successfully'}
                }
            },
            404: {
                'description': 'Cat not found',
                'examples': {
                    'application/json': {'msg': 'Cat not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the cat to delete'
            }
        ]
    })
    def delete(self, cat_id): # Delete a cat by ID
        cat = Cats.query.get(cat_id)
        if not cat:
            return {"msg": "Cat not found"}, 404

        db.session.delete(cat)
        db.session.commit()
        return {"msg": "Cat deleted successfully"}, 200
