from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_restx import Api
import os

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # 配置
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    import os
    db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'instance', 'rd_cost_system.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # 初始化扩展
    db.init_app(app)
    CORS(app, supports_credentials=True)
    api = Api(app, doc='/apidocs/', title='研发成本统计系统 API', version='1.0')
    
    # 注册蓝图
    from app.routes.auth import auth_bp
    from app.routes.users import users_bp
    from app.routes.roles import roles_bp
    from app.routes.projects import projects_bp
    from app.routes.time_records import time_records_bp
    from app.routes.reports import reports_bp
    from app.routes.costs import costs_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(roles_bp, url_prefix='/api/roles')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(time_records_bp, url_prefix='/api/time-records')
    app.register_blueprint(reports_bp, url_prefix='/api/reports')
    app.register_blueprint(costs_bp, url_prefix='/api/costs')
    
    return app 