import os
from flask import jsonify, send_from_directory, request
from flask_restful import Resource, reqparse
from flasgger import swag_from
from models.Cat import CatPhotos, Cats
from models.database import db
import time

# Upload folder setup
UPLOAD_FOLDER = './catphotos/'
os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Create the folder if it doesn't exist
photo_parser = reqparse.RequestParser() # Parser for photo endpoints

class CatPhotoUpload(Resource):
    @swag_from({
        'tags': ['Cat Photos'],
        'summary': 'Upload a photo for a specific cat',
        'consumes': ['multipart/form-data'],  # Specify only multipart/form-data
        'parameters': [
            {
                'name': 'file',
                'in': 'formData',
                'required': True,
                'type': 'file',
                'description': 'Photo file to upload (jpg, jpeg, png, gif)'
            },
            {
                'name': 'cat_id',
                'in': 'formData',
                'required': True,
                'type': 'integer',
                'description': 'ID of the cat to associate with the photo'
            }
        ],
        'responses': {
            200: {
                'description': 'Photo uploaded successfully',
                'examples': {
                    'application/json': {'msg': 'Photo uploaded successfully', 'path': './catphotos/photo1.png'}
                }
            },
            404: {
                'description': 'Cat not found',
                'examples': {
                    'application/json': {'msg': 'Cat not found'}
                }
            },
            400: {
                'description': 'File and cat_id are required',
                'examples': {
                    'application/json': {'msg': 'File and cat_id are required'}
                }
            }
        }
    })
    def post(self):
        # Access form data from the request
        cat_id = request.form.get('cat_id')
        file = request.files.get('file')

        # Check if both file and cat_id are present
        if not file or not cat_id:
            print("File or cat_id is missing in the request")
            return {"msg": "File and cat_id are required"}, 400

        # Cast cat_id to int if necessary
        try:
            cat_id = int(cat_id)
            
        except ValueError:
            print(f"Invalid cat_id: {cat_id}")
            return {"msg": "Invalid cat_id"}, 400

        # Check if the cat exists
        cat = Cats.query.get(cat_id)
        if not cat:
            print(f"Cat with id {cat_id} not found")
            return {"msg": "Cat not found"}, 404

        # Save the file with a unique filename
        filename = f"{cat_id}_{int(time.time())}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        try:
            file.save(filepath)
            print(f"File saved to {filepath}")
        except Exception as e:
            print(f"Error saving file: {e}")
            return {"msg": "File could not be saved"}, 500

        # Add a new photo entry in the CatPhotos table
        try:
            new_photo = CatPhotos(CatId=cat_id, PhotoUrl=filepath)
            db.session.add(new_photo)
            db.session.commit()

        except Exception as e:
            return {"msg": "Failed to save photo to database"}, 500

        return {"msg": "Photo uploaded successfully", "path": filepath}, 200

class CatPhotoDelete(Resource):
    @swag_from({
        'tags': ['Cat Photos'],
        'summary': 'Delete a specific photo by ID',
        'parameters': [
            {
                'name': 'id',
                'in': 'path',
                'required': True,
                'type': 'integer',
                'description': 'ID of the photo to delete'
            }
        ],
        'responses': {
            200: {
                'description': 'Photo deleted successfully',
                'examples': {
                    'application/json': {'msg': 'Photo deleted successfully'}
                }
            },
            404: {
                'description': 'Photo not found',
                'examples': {
                    'application/json': {'msg': 'Photo not found'}
                }
            }
        }
    })
    def delete(self, id):
        photo = CatPhotos.query.filter_by(Id=id).first()
        
        if not photo:
            return {"msg": "Photo not found"}, 404

        # Construct the file path from the database entry
        filepath = photo.PhotoUrl
        
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete the record from the database
        db.session.delete(photo)
        db.session.commit()
        
        return {"msg": "Photo deleted successfully"}, 200


class CatPhotoRetrieve(Resource):
    @swag_from({
        'tags': ['Cat Photos'],
        'summary': 'Retrieve photos for a specific cat by cat_id',
        'parameters': [
            {
                'name': 'cat_id',
                'in': 'query',
                'required': True,
                'type': 'integer',
                'description': 'ID of the cat to retrieve photos for'
            }
        ],
        'responses': {
            200: {
                'description': 'Successfully retrieved photos for the cat',
                'examples': {
                    'application/json': [
                        {'id': 1, 'photo_url': './catphotos/photo1.png'},
                        {'id': 2, 'photo_url': './catphotos/photo2.jpg'}
                    ]
                }
            },
            404: {
                'description': 'No photos found for this cat',
                'examples': {
                    'application/json': {'msg': 'No photos found for this cat'}
                }
            },
            400: {
                'description': 'cat_id is required',
                'examples': {
                    'application/json': {'msg': 'cat_id is required to retrieve photos'}
                }
            }
        }
    })
    def get(self, id):
        if not id:
            return {"msg": "cat_id is required to retrieve photos"}, 400

        # Retrieve all photos for the specified cat ID
        photos = CatPhotos.query.filter_by(CatId=id).all()
        
        if not photos:
            return {"msg": "No photos found for this cat"}, 404

        photo_list = [
            {'id': photo.Id, 
             'photo_url': photo.PhotoUrl
            } for photo in photos
        ]
        return photo_list, 200
    
class CatPhotoServe(Resource):
    def get(self, filename):
        print(f"Serving photo: {filename}")
        return send_from_directory('./catphotos', filename)