from functools import wraps
from flask import request, jsonify, session
from app.models import User

def login_required(fn):
    """Session认证装饰器"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        # 添加调试日志
        print(f"DEBUG: Session user_id: {session.get('user_id')}")
        
        if 'user_id' not in session:
            print("DEBUG: No user_id in session")
            return jsonify({'message': '请先登录'}), 401
        
        return fn(*args, **kwargs)
    return wrapper

def role_required(role_name):
    """角色权限装饰器"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # 添加调试日志
            print(f"DEBUG: Session user_id: {session.get('user_id')}")
            
            if 'user_id' not in session:
                print("DEBUG: No user_id in session")
                return jsonify({'message': '请先登录'}), 401
            
            user_id = session['user_id']
            user = User.query.get(user_id)
            
            if not user:
                print(f"DEBUG: User not found for id: {user_id}")
                return jsonify({'message': '用户不存在'}), 401
            
            print(f"DEBUG: User found: {user.username}, roles: {[role.name for role in user.roles]}")
            
            if not user.has_role(role_name):
                print(f"DEBUG: User {user.username} does not have role: {role_name}")
                return jsonify({'message': '权限不足'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def permission_required(permission_name):
    """权限检查装饰器"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            # 添加调试日志
            print(f"DEBUG: Session user_id: {session.get('user_id')}")
            
            if 'user_id' not in session:
                print("DEBUG: No user_id in session")
                return jsonify({'message': '请先登录'}), 401
            
            user_id = session['user_id']
            user = User.query.get(user_id)
            
            if not user:
                print(f"DEBUG: User not found for id: {user_id}")
                return jsonify({'message': '用户不存在'}), 401
            
            if not user.has_permission(permission_name):
                print(f"DEBUG: User {user.username} does not have permission: {permission_name}")
                return jsonify({'message': '权限不足'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    """获取当前用户"""
    if 'user_id' not in session:
        return None
    
    user_id = session['user_id']
    return User.query.get(user_id) 