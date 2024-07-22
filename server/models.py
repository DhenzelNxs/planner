from flask_sqlalchemy import SQLAlchemy
import json

db = SQLAlchemy()

class Trip(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    destination = db.Column(db.String(50), nullable=False)
    starts_at = db.Column(db.String(50), nullable=False)
    ends_at = db.Column(db.String(50), nullable=False)
    emails_to_invite = db.Column(db.String, nullable=False) 
    owner_name = db.Column(db.String(120), nullable=False)
    owner_email = db.Column(db.String(120), nullable=False)
    is_confirmed = db.Column(db.Boolean, nullable=False, default=False)
    activity = db.relationship('Activity', backref='trip', lazy=True)
    links = db.relationship('Links', backref='trip', lazy=True)
    participants = db.relationship('Participants', backref='trip', lazy=True)
    
    @property
    def emails(self):
        return json.loads(self.emails_to_invite)
    
    @emails.setter
    def emails(self, value):
        self.emails_to_invite = json.dumps(value)

class Activity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    activity = db.relationship('Activities', backref='activity', lazy=True)
    date = db.Column(db.String(50), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)

class Activities(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    occurs_at = db.Column(db.String(50), nullable=False)
    activity_id = db.Column(db.Integer, db.ForeignKey('activity.id'), nullable=False)

class Links(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50), nullable=False)
    url = db.Column(db.String(2048), nullable=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)

class Participants(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    is_confirmed = db.Column(db.Boolean, nullable=False, default=False)
    trip_id = db.Column(db.Integer, db.ForeignKey('trip.id'), nullable=False)
    