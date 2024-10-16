from flasgger import swag_from
from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from models.Cat import Species, db

species_parser = reqparse.RequestParser()
species_parser.add_argument('name', required=True, help="Name cannot be blank.")

class SpeciesList(Resource):
    @swag_from({
        'summary': 'Get all species',
        'responses': {
            200: {
                'description': 'Successfully retrieved all species',
                'examples': {
                    'application/json': [
                        {
                            'id': 1, 
                            'name': 'Domestic Cat'
                        }
                    ]
                }
            }
        }
    })
    def get(self): # Get all species
        species = Species.query.all()
        species_list = [
            {
                'id': sp.Id, 
                'name': sp.Name
            }
            for sp in species
        ]
        response = make_response(jsonify(species_list), 200)
        return response

    @swag_from({
        'summary': 'Create a new species',
        'responses': {
            201: {
                'description': 'Species created successfully',
                'examples': {
                    'application/json': {'msg': 'Species created successfully'}
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
                        'name': {'type': 'string', 'description': 'Name of the species'}
                    },
                    'required': ['name']
                },
                'description': 'JSON object containing species name'
            }
        ]
    })
    def post(self): # Create a new species
        args = species_parser.parse_args()
        new_species = Species(
            Name = args['name']
        )
        db.session.add(new_species)
        db.session.commit()
        return {"msg": "Species created successfully"}, 201


class SpeciesById(Resource):
    @swag_from({
        'summary': 'Get specific species by ID',
        'responses': {
            200: {
                'description': 'Successfully retrieved species by ID',
                'examples': {
                    'application/json': {'id': 1, 'name': 'Domestic Cat'}
                }
            },
            404: {
                'description': 'Species not found',
                'examples': {
                    'application/json': {'msg': 'Species not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'species_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the species to retrieve'
            }
        ]
    })
    def get(self, species_id): # Get species by ID
        species = Species.query.get(species_id)
        if not species:
            return {"msg": "Species not found"}, 404
        
        return {"id": species.Id, "name": species.Name}, 200

    @swag_from({
        'summary': 'Delete a species',
        'responses': {
            200: {
                'description': 'Species deleted successfully',
                'examples': {
                    'application/json': {'msg': 'Species deleted successfully'}
                }
            },
            404: {
                'description': 'Species not found',
                'examples': {
                    'application/json': {'msg': 'Species not found'}
                }
            }
        },
        'parameters': [
            {
                'name': 'species_id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the species to delete'
            }
        ]
    })
    def delete(self, species_id): # Delete a species
        species = Species.query.get(species_id)
        if not species:
            return {"msg": "Species not found"}, 404

        db.session.delete(species)
        db.session.commit()
        return {"msg": "Species deleted successfully"}, 200
