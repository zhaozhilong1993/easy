from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User, Role
from app.middlewares.auth import jwt_required as auth_jwt_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': '用户名和密码不能为空'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not bcrypt.check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': '用户名或密码错误'}), 401
    
    if user.status != 'active':
        return jsonify({'message': '账户已被禁用'}), 401
    
    # 创建访问令牌和刷新令牌，确保identity是字符串
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'message': '登录成功',
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/register', methods=['POST'])
def register():
    """用户注册"""
    data = request.get_json()
    
    # 验证必填字段
    required_fields = ['username', 'email', 'password', 'name', 'employee_id']
    for field in required_fields:
        if not data.get(field):
            return jsonify({'message': f'{field}不能为空'}), 400
    
    # 检查用户名和邮箱是否已存在
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': '用户名已存在'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': '邮箱已存在'}), 400
    
    if User.query.filter_by(employee_id=data['employee_id']).first():
        return jsonify({'message': '工号已存在'}), 400
    
    # 创建新用户
    password_hash = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash,
        name=data['name'],
        employee_id=data['employee_id'],
        department=data.get('department'),
        position=data.get('position'),
        hourly_rate=data.get('hourly_rate'),
        monthly_salary=data.get('monthly_salary'),
        cost_calculation_method=data.get('cost_calculation_method', 'hourly')
    )
    
    # 分配默认角色（研发人员）
    default_role = Role.query.filter_by(name='developer').first()
    if default_role:
        user.roles.append(default_role)
    
    try:
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': '注册成功',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '注册失败'}), 500

@auth_bp.route('/refresh', methods=['POST'])
@auth_jwt_required
def refresh():
    """刷新访问令牌"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(current_user_id))
    
    return jsonify({
        'access_token': access_token
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@auth_jwt_required
def get_profile():
    """获取当前用户信息"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@auth_jwt_required
def update_profile():
    """更新当前用户信息"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['name', 'email', 'department', 'position']
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '更新成功',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '更新失败'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@auth_jwt_required
def change_password():
    """修改密码"""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    data = request.get_json()
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'message': '旧密码和新密码不能为空'}), 400
    
    if not bcrypt.check_password_hash(user.password_hash, data['old_password']):
        return jsonify({'message': '旧密码错误'}), 400
    
    # 更新密码
    user.password_hash = bcrypt.generate_password_hash(data['new_password']).decode('utf-8')
    
    try:
        db.session.commit()
        return jsonify({'message': '密码修改成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '密码修改失败'}), 500 