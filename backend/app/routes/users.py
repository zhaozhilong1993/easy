from flask import Blueprint, request, jsonify
from app import db
from app.models import User, Role
from app.middlewares.auth import login_required, role_required

users_bp = Blueprint('users', __name__)

@users_bp.route('/', methods=['GET'])
@login_required
def get_users():
    """获取用户列表 - 所有登录用户都可以访问"""
    users = User.query.all()
    
    return jsonify({
        'users': [user.to_dict() for user in users]
    }), 200

@users_bp.route('/<int:user_id>', methods=['GET'])
@login_required
def get_user(user_id):
    """获取用户详情 - 所有登录用户都可以访问"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    return jsonify({
        'user': user.to_dict()
    }), 200

@users_bp.route('/', methods=['POST'])
@login_required
@role_required('admin')
def create_user():
    """创建用户"""
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
    from werkzeug.security import generate_password_hash
    password_hash = generate_password_hash(data['password'])
    
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash,
        name=data['name'],
        employee_id=data['employee_id'],
        department=data.get('department'),
        position=data.get('position'),
        status=data.get('status', 'active'),
        hourly_rate=data.get('hourly_rate'),
        monthly_salary=data.get('monthly_salary'),
        cost_calculation_method=data.get('cost_calculation_method', 'hourly')
    )
    
    # 分配角色
    if data.get('roles'):
        roles = Role.query.filter(Role.name.in_(data['roles'])).all()
        user.roles = roles
    
    try:
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': '用户创建成功',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '用户创建失败'}), 500

@users_bp.route('/<int:user_id>', methods=['PUT'])
@login_required
@role_required('admin')
def update_user(user_id):
    """更新用户信息"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = [
        'name', 'email', 'department', 'position', 'status',
        'hourly_rate', 'monthly_salary', 'cost_calculation_method'
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(user, field, data[field])
    
    # 更新角色
    if 'roles' in data:
        if data['roles']:
            roles = Role.query.filter(Role.name.in_(data['roles'])).all()
            user.roles = roles
        else:
            user.roles = []  # 清空角色
    
    try:
        db.session.commit()
        return jsonify({
            'message': '用户更新成功',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '用户更新失败'}), 500

@users_bp.route('/<int:user_id>', methods=['DELETE'])
@login_required
@role_required('admin')
def delete_user(user_id):
    """删除用户"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': '用户删除成功'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '用户删除失败'}), 500

@users_bp.route('/<int:user_id>/status', methods=['PUT'])
@login_required
@role_required('admin')
def update_user_status(user_id):
    """更新用户状态"""
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    
    data = request.get_json()
    new_status = data.get('status')
    
    if new_status not in ['active', 'inactive']:
        return jsonify({'message': '状态值无效'}), 400
    
    user.status = new_status
    
    try:
        db.session.commit()
        return jsonify({
            'message': '用户状态更新成功',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '用户状态更新失败'}), 500

@users_bp.route('/departments', methods=['GET'])
@login_required
def get_departments():
    """获取部门列表"""
    departments = db.session.query(User.department).distinct().filter(User.department.isnot(None)).all()
    return jsonify({
        'departments': [dept[0] for dept in departments]
    }), 200

# 个人资料相关接口
@users_bp.route('/profile', methods=['GET'])
@login_required
def get_profile():
    """获取当前用户个人资料"""
    from app.middlewares.auth import get_current_user
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'message': '用户未登录'}), 401
    
    return jsonify({
        'profile': current_user.to_dict()
    }), 200

@users_bp.route('/profile', methods=['PUT'])
@login_required
def update_profile():
    """更新当前用户个人资料"""
    from app.middlewares.auth import get_current_user
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'message': '用户未登录'}), 401
    
    data = request.get_json()
    
    # 允许更新的字段
    allowed_fields = ['name', 'email', 'department', 'position', 'hourly_rate', 'monthly_salary']
    
    for field in allowed_fields:
        if field in data:
            setattr(current_user, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '个人资料更新成功',
            'profile': current_user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '个人资料更新失败'}), 500

@users_bp.route('/profile/password', methods=['PUT'])
@login_required
def update_password():
    """更新当前用户密码"""
    from app.middlewares.auth import get_current_user
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'message': '用户未登录'}), 401
    
    data = request.get_json()
    
    # 验证必填字段
    if not data.get('old_password'):
        return jsonify({'message': '原密码不能为空'}), 400
    
    if not data.get('new_password'):
        return jsonify({'message': '新密码不能为空'}), 400
    
    # 验证原密码
    from werkzeug.security import check_password_hash
    if not check_password_hash(current_user.password_hash, data['old_password']):
        return jsonify({'message': '原密码错误'}), 400
    
    # 更新密码
    from werkzeug.security import generate_password_hash
    current_user.password_hash = generate_password_hash(data['new_password'])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '密码更新成功'
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '密码更新失败'}), 500

@users_bp.route('/profile/settings', methods=['GET'])
@login_required
def get_settings():
    """获取当前用户设置"""
    from app.middlewares.auth import get_current_user
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'message': '用户未登录'}), 401
    
    return jsonify({
        'settings': {
            'cost_calculation_method': current_user.cost_calculation_method,
            'hourly_rate': current_user.hourly_rate,
            'monthly_salary': current_user.monthly_salary,
            'status': current_user.status
        }
    }), 200

@users_bp.route('/profile/settings', methods=['PUT'])
@login_required
def update_settings():
    """更新当前用户设置"""
    from app.middlewares.auth import get_current_user
    current_user = get_current_user()
    
    if not current_user:
        return jsonify({'message': '用户未登录'}), 401
    
    data = request.get_json()
    
    # 允许更新的设置字段
    allowed_fields = ['cost_calculation_method', 'hourly_rate', 'monthly_salary']
    
    for field in allowed_fields:
        if field in data:
            setattr(current_user, field, data[field])
    
    try:
        db.session.commit()
        return jsonify({
            'message': '设置更新成功',
            'settings': {
                'cost_calculation_method': current_user.cost_calculation_method,
                'hourly_rate': current_user.hourly_rate,
                'monthly_salary': current_user.monthly_salary,
                'status': current_user.status
            }
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': '设置更新失败'}), 500 