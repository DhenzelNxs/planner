from flask import Blueprint, request, jsonify
from models import db, Trip, Activities, Activity, Links, Participants
from datetime import datetime, timedelta
import json

api = Blueprint('api', __name__)

@api.route('/trips', methods=['POST'])
def create_trip():
    data = request.json
    start_date_str = data['starts_at']
    end_date_str = data['ends_at']
    
    # Converte as datas do formato string para datetime
    start_date = datetime.strptime(start_date_str, '%a, %d %b %Y %H:%M:%S GMT')
    end_date = datetime.strptime(end_date_str, '%a, %d %b %Y %H:%M:%S GMT')
    
    new_trip = Trip(
        destination=data['destination'],
        starts_at=start_date_str,  # Mantém o formato original
        ends_at=end_date_str,      # Mantém o formato original
        emails_to_invite=json.dumps(data['emails_to_invite']),
        owner_name=data['owner_name'],
        owner_email=data['owner_email'],
        is_confirmed=data.get('is_confirmed', True)
    )
    db.session.add(new_trip)
    db.session.commit()

    # Adiciona atividades para cada dia da viagem
    current_date = start_date

    while current_date <= end_date:
        # Formata a data no formato desejado
        
        new_activity = Activity(
            date=current_date,
            trip_id=new_trip.id
        )
        db.session.add(new_activity)
        
        current_date += timedelta(days=1)

    db.session.commit()

    participants = data['emails_to_invite']

    for participant in participants:
        new_participant = Participants(
            email=participant,
            trip_id=new_trip.id
        )
        db.session.add(new_participant)

    db.session.commit()
    
    return jsonify({
        "tripId": f"{new_trip.id}",
    }), 201
    
@api.route('/trips/<int:tripId>', methods=['GET'])
def get_trip_details(tripId):
    trips = Trip.query.all()
    output = []

    for trip in trips:
        if trip.id == tripId:
            trip_data = {
                'id': trip.id,
                'destination': trip.destination,
                'starts_at': trip.starts_at,
                'ends_at': trip.ends_at,
                'is_confirmed': trip.is_confirmed
            }
            output.append(trip_data)
    
    if output:
        return jsonify({'trip': output[0]}), 200
    else:
        return jsonify({'message': 'not items in list'}), 200

@api.route('/trips/<int:tripId>', methods=['PUT'])
def update_trip(tripId):
    trip = Trip.query.get(tripId)
    data = request.json

    trip.destination = data['destination']
    trip.starts_at = data['starts_at']
    trip.ends_at = data['ends_at']

    db.session.commit()
    return jsonify({"message": "Trip updated"}), 200

@api.route('/trips/<int:tripId>/activities', methods=['POST'])
def create_activity(tripId):
    trip = Trip.query.get(tripId)
    data = request.json

    occurs_at = data['occurs_at']

    request_date = f'{occurs_at[5]}{occurs_at[6]}'
    print(occurs_at)
    activity_id = 0

    for activity in trip.activity:
        if request_date == f'{activity.date[8]}{activity.date[9]}':
            new_activities = Activities(
                title=data['title'],
                occurs_at=data['occurs_at'],
                activity_id=activity.id
            )

            activity_id = new_activities.id
            db.session.add(new_activities)

    db.session.commit()

    return jsonify({ 'activityId': f'{activity_id}' }), 200

@api.route('/trips/<int:tripId>/activities', methods=['GET'])
def get_trip_activities(tripId):
    trip = Trip.query.get(tripId)
    output = []

    for activity in trip.activity:
        activities_list = []
        for sub_activity in activity.activity:
            sub_activity_data = {
                'title': sub_activity.title,
                'occurs_at': sub_activity.occurs_at
            }
            activities_list.append(sub_activity_data)

        activity_data = {
            'date': activity.date,
            'activities': activities_list,
        }
        output.append(activity_data)

    return jsonify({'activities': output}), 200

@api.route('/trips/<int:tripId>/links', methods=['POST'])
def create_links(tripId):
    trip = Trip.query.get(tripId)
    data = request.json

    new_link = Links(
        title=data['title'],
        url=data['url'],
        trip_id=trip.id
    )

    db.session.add(new_link)
    db.session.commit()

    return jsonify({ "linkId": new_link.id }), 200

@api.route('/trips/<int:tripId>/links', methods=['GET'])
def get_links(tripId):
    trip = Trip.query.get(tripId)
    output = []

    for link in trip.links:
        links_data = {
            'id': link.id,
            'title': link.title,
            'url': link.url
        }
        output.append(links_data)

    return jsonify({ "links": output }), 200

@api.route('/trips/<int:tripId>/participants', methods=['GET'])
def get_participants(tripId):
    trip = Trip.query.get(tripId)
    output = []

    for participant in trip.participants:
        participants_data = {
            "id": participant.id,
            "name": participant.name,
            "email": participant.email,
            "is_confirmed": participant.is_confirmed
        }

        output.append(participants_data)

    return jsonify({ "participants": output }), 200


@api.route('/participants/<int:participantId>/confirm', methods=['PATCH'])
def confirm_participant(participantId):
    data = request.json
    trip = Trip.query.get(data['tripId'])

    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    participant_found = False
    for participant in trip.participants:
        if participant.id == participantId:
            participant.is_confirmed = True
            participant_found = True
            participant.name = data['name']


    if not participant_found:
        return jsonify({"error": "Participant not found"}), 404

    db.session.commit()
    return jsonify({"message": "Participant confirmed"}), 200