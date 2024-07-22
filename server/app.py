from flask import Flask
from config import Config
from flask_cors import CORS
from models import db
from routes import api

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

app.register_blueprint(api, url_prefix='/api')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3333 ,debug=True)
