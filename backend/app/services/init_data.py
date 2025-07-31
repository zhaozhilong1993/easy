from app import db
from app.models import User, Role, Permission
from werkzeug.security import generate_password_hash

def init_roles_and_permissions():
    """初始化角色和权限"""
    print("开始初始化数据库...")
    
    # 定义权限
    permissions_data = [
        # 用户管理权限
        {'name': 'user_create', 'description': '创建用户', 'resource': 'user', 'action': 'create'},
        {'name': 'user_read', 'description': '查看用户', 'resource': 'user', 'action': 'read'},
        {'name': 'user_update', 'description': '更新用户', 'resource': 'user', 'action': 'update'},
        {'name': 'user_delete', 'description': '删除用户', 'resource': 'user', 'action': 'delete'},
        
        # 角色管理权限
        {'name': 'role_create', 'description': '创建角色', 'resource': 'role', 'action': 'create'},
        {'name': 'role_read', 'description': '查看角色', 'resource': 'role', 'action': 'read'},
        {'name': 'role_update', 'description': '更新角色', 'resource': 'role', 'action': 'update'},
        {'name': 'role_delete', 'description': '删除角色', 'resource': 'role', 'action': 'delete'},
        
        # 项目管理权限
        {'name': 'project_create', 'description': '创建项目', 'resource': 'project', 'action': 'create'},
        {'name': 'project_read', 'description': '查看项目', 'resource': 'project', 'action': 'read'},
        {'name': 'project_update', 'description': '更新项目', 'resource': 'project', 'action': 'update'},
        {'name': 'project_delete', 'description': '删除项目', 'resource': 'project', 'action': 'delete'},
        
        # 工时记录权限
        {'name': 'time_record_create', 'description': '创建工时记录', 'resource': 'time_record', 'action': 'create'},
        {'name': 'time_record_read', 'description': '查看工时记录', 'resource': 'time_record', 'action': 'read'},
        {'name': 'time_record_update', 'description': '更新工时记录', 'resource': 'time_record', 'action': 'update'},
        {'name': 'time_record_delete', 'description': '删除工时记录', 'resource': 'time_record', 'action': 'delete'},
        {'name': 'time_record_approve', 'description': '审核工时记录', 'resource': 'time_record', 'action': 'approve'},
        
        # 报告权限
        {'name': 'report_create', 'description': '创建报告', 'resource': 'report', 'action': 'create'},
        {'name': 'report_read', 'description': '查看报告', 'resource': 'report', 'action': 'read'},
        {'name': 'report_update', 'description': '更新报告', 'resource': 'report', 'action': 'update'},
        {'name': 'report_delete', 'description': '删除报告', 'resource': 'report', 'action': 'delete'},
        {'name': 'report_approve', 'description': '审核报告', 'resource': 'report', 'action': 'approve'},
        
        # 成本管理权限
        {'name': 'cost_calculate', 'description': '计算成本', 'resource': 'cost', 'action': 'calculate'},
        {'name': 'cost_read', 'description': '查看成本', 'resource': 'cost', 'action': 'read'},
        {'name': 'cost_update', 'description': '更新成本', 'resource': 'cost', 'action': 'update'},
        {'name': 'cost_delete', 'description': '删除成本', 'resource': 'cost', 'action': 'delete'},
        
        # 报告生成权限
        {'name': 'report_generate', 'description': '生成报告', 'resource': 'report', 'action': 'generate'},
    ]
    
    # 创建权限
    for perm_data in permissions_data:
        permission = Permission.query.filter_by(name=perm_data['name']).first()
        if not permission:
            permission = Permission(
                name=perm_data['name'],
                description=perm_data['description'],
                resource=perm_data['resource'],
                action=perm_data['action']
            )
            db.session.add(permission)
    
    # 定义角色
    roles_data = [
        {
            'name': 'admin',
            'description': '系统管理员',
            'permissions': [
                'user_create', 'user_read', 'user_update', 'user_delete',
                'role_create', 'role_read', 'role_update', 'role_delete',
                'project_create', 'project_read', 'project_update', 'project_delete',
                'time_record_create', 'time_record_read', 'time_record_update', 'time_record_delete', 'time_record_approve',
                'report_create', 'report_read', 'report_update', 'report_delete', 'report_approve',
                'cost_calculate', 'cost_read', 'cost_update', 'cost_delete',
                'report_generate'
            ]
        },
        {
            'name': 'manager',
            'description': '项目经理',
            'permissions': [
                'project_read', 'project_update',
                'time_record_read', 'time_record_approve',
                'report_create', 'report_read', 'report_update', 'report_approve',
                'cost_read', 'cost_calculate',
                'report_generate'
            ]
        },
        {
            'name': 'developer',
            'description': '研发人员',
            'permissions': [
                'project_read',
                'time_record_create', 'time_record_read', 'time_record_update',
                'report_create', 'report_read', 'report_update',
                'cost_read'
            ]
        }
    ]
    
    # 创建角色并分配权限
    for role_data in roles_data:
        role = Role.query.filter_by(name=role_data['name']).first()
        if not role:
            role = Role(
                name=role_data['name'],
                description=role_data['description']
            )
            db.session.add(role)
            db.session.flush()  # 获取role.id
        
        # 分配权限
        for perm_name in role_data['permissions']:
            permission = Permission.query.filter_by(name=perm_name).first()
            if permission and permission not in role.permissions:
                role.permissions.append(permission)
    
    try:
        db.session.commit()
        print("角色和权限初始化成功")
    except Exception as e:
        db.session.rollback()
        print(f"角色和权限初始化失败: {e}")
        raise

def create_admin_user():
    """创建管理员用户"""
    # 检查是否已存在管理员用户
    admin_user = User.query.filter_by(username='admin').first()
    if admin_user:
        print("管理员用户已存在")
        return
    
    # 创建管理员用户
    admin_user = User(
        username='admin',
        email='admin@example.com',
        password_hash=generate_password_hash('admin123'),
        name='系统管理员',
        employee_id='ADMIN001',
        department='技术部',
        position='系统管理员',
        status='active',
        hourly_rate=100.00,
        monthly_salary=15000.00,
        cost_calculation_method='hourly'
    )
    
    # 分配管理员角色
    admin_role = Role.query.filter_by(name='admin').first()
    if admin_role:
        admin_user.roles.append(admin_role)
    
    try:
        db.session.add(admin_user)
        db.session.commit()
        print("管理员用户创建成功")
        print("用户名: admin")
        print("密码: admin123")
    except Exception as e:
        db.session.rollback()
        print(f"管理员用户创建失败: {e}")
        raise

def init_database():
    """初始化数据库"""
    init_roles_and_permissions()
    create_admin_user() 