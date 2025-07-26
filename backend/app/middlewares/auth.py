from functools import wraps
from flask import request, jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User

def jwt_required(fn):
    """JWT认证装饰器"""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper

def role_required(role_name):
    """角色权限装饰器"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.has_role(role_name):
                return jsonify({'message': '权限不足'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def permission_required(permission_name):
    """权限检查装饰器"""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)
            
            if not user or not user.has_permission(permission_name):
                return jsonify({'message': '权限不足'}), 403
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def get_current_user():
    """获取当前用户"""
    try:
        verify_jwt_in_request()
        current_user_id = get_jwt_identity()
        return User.query.get(current_user_id)
    except:
        return None 