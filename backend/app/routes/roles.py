from flask import Blueprint, request, jsonify
from app import db
from app.models import Role, Permission
from app.middlewares.auth import jwt_required, role_required

roles_bp = Blueprint('roles', __name__)

@roles_bp.route('/', methods=['GET'])
@jwt_required
@role_required('admin')
def get_roles():
    """获取角色列表"""
    roles = Role.query.all()
    
    return jsonify({
        'roles': [role.to_dict() for role in roles]
    }), 200

@roles_bp.route('/<int:role_id>', methods=['GET'])
@jwt_required
@role_required('admin')
def get_role(role_id):
    """获取角色详情"""
    role = Role.query.get(role_id)
    
    if not role:
        return jsonify({'message': '角色不存在'}), 404
    
    return jsonify({
        'role': role.to_dict()
    }), 200

@roles_bp.route('/', methods=['POST'])
@jwt_required
@role_required('admin')
def create_role():
    """创建角色"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': '角色名称不能为空'}), 400
    
    if Role.query.filter_by(name=data['name']).first():
        return jsonify({'message': '角色名称已存在'}), 400
    
    role = Role(
        name=data['name'],
        description=data.get('description', '')
    )
    
    # 分配权限
    if data.get('permissions'):
        permissions = Permission.query.filter(
            Permission.name.in_(data['permissions'])
        ).all()
        role.permissions = permissions
    
    try:
        db.session.add(role)
        db.session.commit()
        
        return jsonify({
            'message': '角色创建成功',
            'role': role.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '角色创建失败'}), 500

@roles_bp.route('/<int:role_id>', methods=['PUT'])
@jwt_required
@role_required('admin')
def update_role(role_id):
    """更新角色"""
    role = Role.query.get(role_id)
    
    if not role:
        return jsonify({'message': '角色不存在'}), 404
    
    data = request.get_json()
    
    if data.get('name'):
        # 检查名称是否重复
        existing_role = Role.query.filter_by(name=data['name']).first()
        if existing_role and existing_role.id != role_id:
            return jsonify({'message': '角色名称已存在'}), 400
        role.name = data['name']
    
    if data.get('description'):
        role.description = data['description']
    
    # 更新权限
    if data.get('permissions'):
        permissions = Permission.query.filter(
            Permission.name.in_(data['permissions'])
        ).all()
        role.permissions = permissions
    
    try:
        db.session.commit()
        return jsonify({
            'message': '角色更新成功',
            'role': role.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '角色更新失败'}), 500

@roles_bp.route('/<int:role_id>', methods=['DELETE'])
@jwt_required
@role_required('admin')
def delete_role(role_id):
    """删除角色"""
    role = Role.query.get(role_id)
    
    if not role:
        return jsonify({'message': '角色不存在'}), 404
    
    # 检查是否有用户使用此角色
    if role.users.count() > 0:
        return jsonify({'message': '该角色下还有用户，无法删除'}), 400
    
    try:
        db.session.delete(role)
        db.session.commit()
        return jsonify({'message': '角色删除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '角色删除失败'}), 500

@roles_bp.route('/permissions', methods=['GET'])
@jwt_required
@role_required('admin')
def get_permissions():
    """获取权限列表"""
    permissions = Permission.query.all()
    
    return jsonify({
        'permissions': [permission.to_dict() for permission in permissions]
    }), 200

@roles_bp.route('/permissions', methods=['POST'])
@jwt_required
@role_required('admin')
def create_permission():
    """创建权限"""
    data = request.get_json()
    
    if not data.get('name'):
        return jsonify({'message': '权限名称不能为空'}), 400
    
    if Permission.query.filter_by(name=data['name']).first():
        return jsonify({'message': '权限名称已存在'}), 400
    
    permission = Permission(
        name=data['name'],
        description=data.get('description', ''),
        resource=data.get('resource', ''),
        action=data.get('action', '')
    )
    
    try:
        db.session.add(permission)
        db.session.commit()
        
        return jsonify({
            'message': '权限创建成功',
            'permission': permission.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '权限创建失败'}), 500 