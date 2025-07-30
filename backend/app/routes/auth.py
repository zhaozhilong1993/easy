from flask import Blueprint, request, jsonify, session
from werkzeug.security import check_password_hash
from app.models import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    """用户登录"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': '用户名和密码不能为空'}), 400
    
    username = data['username']
    password = data['password']
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': '用户名或密码错误'}), 401
    
    if not user.is_active:
        return jsonify({'message': '账户已被禁用'}), 401
    
    # 设置session
    session['user_id'] = user.id
    session['username'] = user.username
    
    print(f"DEBUG: User logged in: {user.username}, session user_id: {session.get('user_id')}")
    
    return jsonify({
        'message': '登录成功',
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'roles': [role.name for role in user.roles]
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
def logout():
    """用户登出"""
    session.clear()
    return jsonify({'message': '登出成功'}), 200

@auth_bp.route('/profile', methods=['GET'])
def get_profile():
    """获取用户信息"""
    if 'user_id' not in session:
        return jsonify({'message': '请先登录'}), 401
    
    user = User.query.get(session['user_id'])
    if not user:
        return jsonify({'message': '用户不存在'}), 401
    
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'name': user.name,
            'email': user.email,
            'roles': [role.name for role in user.roles]
        }
    }), 200 