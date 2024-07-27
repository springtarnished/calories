import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import pytz
from werkzeug.exceptions import BadRequest
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///calorie_tracker.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class CalorieEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, nullable=False, index=True)
    food_item = db.Column(db.String(100), nullable=False)
    serving_size = db.Column(db.Float, nullable=False)
    calories_per_serving = db.Column(db.Integer, nullable=False)
    total_calories = db.Column(db.Float, nullable=False)

@app.route('/api/v1/add_entry', methods=['POST'])
def add_entry():
    try:
        data = request.json
        if not all(key in data for key in ('food_item', 'serving_size', 'calories_per_serving')):
            raise BadRequest('Missing required fields')

        arizona_tz = pytz.timezone('America/Phoenix')
        current_date = datetime.now(arizona_tz).date()
        
        new_entry = CalorieEntry(
            date=current_date,
            food_item=data['food_item'],
            serving_size=float(data['serving_size']),
            calories_per_serving=int(data['calories_per_serving']),
            total_calories=float(data['serving_size']) * int(data['calories_per_serving'])
        )
        
        db.session.add(new_entry)
        db.session.commit()
        
        logger.info(f"New entry added: {new_entry.food_item}")
        return jsonify({"message": "Entry added successfully"}), 201
    except BadRequest as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error adding entry: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/api/v1/get_entries', methods=['GET'])
def get_entries():
    try:
        arizona_tz = pytz.timezone('America/Phoenix')
        current_date = datetime.now(arizona_tz).date()
        
        entries = CalorieEntry.query.filter_by(date=current_date).all()
        entries_data = [
            {
                'id': entry.id,
                'food_item': entry.food_item,
                'serving_size': entry.serving_size,
                'calories_per_serving': entry.calories_per_serving,
                'total_calories': entry.total_calories
            } for entry in entries
        ]
        
        return jsonify(entries_data)
    except Exception as e:
        logger.error(f"Error retrieving entries: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/api/v1/get_total_calories', methods=['GET'])
def get_total_calories():
    try:
        arizona_tz = pytz.timezone('America/Phoenix')
        current_date = datetime.now(arizona_tz).date()
        
        total_calories = db.session.query(db.func.sum(CalorieEntry.total_calories))\
                          .filter(CalorieEntry.date == current_date)\
                          .scalar() or 0
        
        return jsonify({"total_calories": total_calories})
    except Exception as e:
        logger.error(f"Error calculating total calories: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))
