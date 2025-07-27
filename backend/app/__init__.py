from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_restx import Api
from config.config import config

# 初始化扩展
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()
api = Api(
    title='研发成本统计系统 API',
    version='1.0',
    description='企业研发成本管理和统计分析平台 API 文档',
    doc='/apidocs/',
    authorizations={
        'apikey': {
            'type': 'apiKey',
            'in': 'header',
            'name': 'Authorization',
            'description': "Type 'Bearer ' + JWT token"
        }
    },
    security='apikey'
)

def create_app(config_name='default'):
    """应用工厂函数"""
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # 确保JWT_SECRET_KEY设置正确
    if not app.config.get('JWT_SECRET_KEY'):
        app.config['JWT_SECRET_KEY'] = 'dev-jwt-secret-key'
    
    # 初始化扩展
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app)
    api.init_app(app)
    
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
    
    # 创建数据库表
    with app.app_context():
        db.create_all()
    
    return app 