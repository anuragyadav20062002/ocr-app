import os
import re
import json
from google.cloud import vision
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Set the Google Application Credentials environment variable
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = 'C:/Users/91945/Desktop/ocr-app/server/credentials.json'

# MongoDB connection
client = MongoClient("mongodb+srv://anuragyadav20602:uQ3cyJkXIE089dcL@cluster0.d3qap3r.mongodb.net/")
db = client['ocr_database']
collection = db['ocr_data']

def detect_text(path):
    """Detects text in the file."""
    client = vision.ImageAnnotatorClient()

    with open(path, "rb") as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.text_detection(image=image)
    texts = response.text_annotations

    if response.error.message:
        raise Exception(
            "{}\nFor more info on error messages, check: "
            "https://cloud.google.com/apis/design/errors".format(response.error.message)
        )

    return texts[0].description if texts else ""

def extract_info(text):
    """Extracts required information from the detected text."""
    info = {}

    # Regular expressions to match the required fields
    id_number_pattern = re.compile(r"Identification Number\s*(\d{1,2}\s*\d{4}\s*\d{5}\s*\d{2}\s*\d{1})")
    name_pattern = re.compile(r"Name\s*(Miss|Mr|Mrs)\s*([A-Za-z]+)")
    last_name_pattern = re.compile(r"Last name\s*([A-Za-z]+)")
    dob_pattern = re.compile(r"Date of Birth\s*(\d{1,2}\s*[A-Za-z]{3}\.\s*\d{4})")
    doi_pattern = re.compile(r"Date of Issue\s*(\d{1,2}\s*[A-Za-z]{3},\s*\d{4})")
    doe_pattern = re.compile(r"Date of Expiry\s*(\d{1,2}\s*[A-Za-z]{3}\.\s*\d{4})")
    alt_doi_pattern = re.compile(r"วันออกบัตร\s*(\d{1,2}\s*[A-Za-z]{3},\s*\d{4})")
    alt_doe_pattern = re.compile(r"วันบัตรหมดอายุ\s*(\d{1,2}\s*[A-Za-z]{3},\s*\d{4})")
    alt_doe_pattern_2 = re.compile(r"(\d{1,2}\s*[A-Za-z]{3}\.\s*\d{4})\s*WE\s*Date of Expiry")

    # Extracting the information using the patterns
    id_number_match = id_number_pattern.search(text)
    name_match = name_pattern.search(text)
    last_name_match = last_name_pattern.search(text)
    dob_match = dob_pattern.search(text)
    doi_match = doi_pattern.search(text) or alt_doi_pattern.search(text)
    doe_match = doe_pattern.search(text) or alt_doe_pattern.search(text) or alt_doe_pattern_2.search(text)

    if id_number_match:
        info["identification_number"] = id_number_match.group(1)
    if name_match:
        info["name"] = name_match.group(1)+" "+name_match.group(2)
    if last_name_match:
        info["last_name"] = last_name_match.group(1)
    if dob_match:
        info["date_of_birth"] = dob_match.group(1)
    if doi_match:
        info["date_of_issue"] = doi_match.group(1)
    if doe_match:
        info["date_of_expiry"] = doe_match.group(1)

    return info

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file:
        file_path = os.path.join('images', file.filename)
        file.save(file_path)
        text = detect_text(file_path)
        info = extract_info(text)
        return jsonify(info)

@app.route('/save', methods=['POST'])
def save_data():
    data = request.json
    collection.insert_one(data)
    return jsonify({'status': 'success'}), 201

@app.route('/data', methods=['GET'])
def get_data():
    data = list(collection.find())
    for item in data:
        item['_id'] = str(item['_id'])
    return jsonify(data)

@app.route('/data/<id>', methods=['PUT'])
def update_data(id):
    data = request.json
    collection.update_one({'_id': ObjectId(id)}, {'$set': data})
    return jsonify({'status': 'success'}), 200

@app.route('/data/<id>', methods=['DELETE'])
def delete_data(id):
    collection.update_one({'_id': ObjectId(id)}, {'$set': {'deleted': True}})
    return jsonify({'status': 'success'}), 200

if __name__ == "__main__":
    app.run(debug=True)