from app import db
from app.models import Role, Permission

def init_roles_and_permissions():
    """初始化角色和权限数据"""
    
    # 创建权限
    permissions = [
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
        
        # 时间记录权限
        {'name': 'time_record_create', 'description': '创建时间记录', 'resource': 'time_record', 'action': 'create'},
        {'name': 'time_record_read', 'description': '查看时间记录', 'resource': 'time_record', 'action': 'read'},
        {'name': 'time_record_update', 'description': '更新时间记录', 'resource': 'time_record', 'action': 'update'},
        {'name': 'time_record_delete', 'description': '删除时间记录', 'resource': 'time_record', 'action': 'delete'},
        {'name': 'time_record_approve', 'description': '审核时间记录', 'resource': 'time_record', 'action': 'approve'},
        
        # 日报周报权限
        {'name': 'report_create', 'description': '创建报告', 'resource': 'report', 'action': 'create'},
        {'name': 'report_read', 'description': '查看报告', 'resource': 'report', 'action': 'read'},
        {'name': 'report_update', 'description': '更新报告', 'resource': 'report', 'action': 'update'},
        {'name': 'report_delete', 'description': '删除报告', 'resource': 'report', 'action': 'delete'},
        {'name': 'report_approve', 'description': '审核报告', 'resource': 'report', 'action': 'approve'},
        
        # 成本计算权限
        {'name': 'cost_calculate', 'description': '成本计算', 'resource': 'cost', 'action': 'calculate'},
        {'name': 'cost_read', 'description': '查看成本', 'resource': 'cost', 'action': 'read'},
        
        # 报表权限
        {'name': 'report_generate', 'description': '生成报表', 'resource': 'report', 'action': 'generate'},
        {'name': 'report_export', 'description': '导出报表', 'resource': 'report', 'action': 'export'},
    ]
    
    # 创建权限记录
    for perm_data in permissions:
        permission = Permission.query.filter_by(name=perm_data['name']).first()
        if not permission:
            permission = Permission(**perm_data)
            db.session.add(permission)
    
    # 创建角色
    roles = [
        {
            'name': 'admin',
            'description': '系统管理员',
            'permissions': [
                'user_create', 'user_read', 'user_update', 'user_delete',
                'role_create', 'role_read', 'role_update', 'role_delete',
                'project_create', 'project_read', 'project_update', 'project_delete',
                'time_record_create', 'time_record_read', 'time_record_update', 'time_record_delete', 'time_record_approve',
                'report_create', 'report_read', 'report_update', 'report_delete', 'report_approve',
                'cost_calculate', 'cost_read',
                'report_generate', 'report_export'
            ]
        },
        {
            'name': 'project_manager',
            'description': '项目管理员',
            'permissions': [
                'project_create', 'project_read', 'project_update',
                'time_record_read', 'time_record_approve',
                'report_read', 'report_approve',
                'cost_read',
                'report_generate'
            ]
        },
        {
            'name': 'developer',
            'description': '研发人员',
            'permissions': [
                'time_record_create', 'time_record_read', 'time_record_update',
                'report_create', 'report_read', 'report_update',
                'cost_read'
            ]
        },
        {
            'name': 'finance',
            'description': '财务管理员',
            'permissions': [
                'cost_calculate', 'cost_read',
                'report_generate', 'report_export'
            ]
        }
    ]
    
    # 创建角色记录
    for role_data in roles:
        role = Role.query.filter_by(name=role_data['name']).first()
        if not role:
            role = Role(name=role_data['name'], description=role_data['description'])
            db.session.add(role)
            db.session.flush()  # 获取role.id
            
            # 分配权限
            permissions = Permission.query.filter(
                Permission.name.in_(role_data['permissions'])
            ).all()
            role.permissions = permissions
    
    try:
        db.session.commit()
        print("角色和权限初始化成功")
    except Exception as e:
        db.session.rollback()
        print(f"角色和权限初始化失败: {e}")

def create_admin_user():
    """创建默认管理员用户"""
    from app.models import User
    from app import bcrypt
    
    # 检查是否已存在管理员用户
    admin_user = User.query.filter_by(username='admin').first()
    if admin_user:
        print("管理员用户已存在")
        return
    
    # 创建管理员用户
    password_hash = bcrypt.generate_password_hash('admin123').decode('utf-8')
    admin_user = User(
        username='admin',
        email='admin@example.com',
        password_hash=password_hash,
        name='系统管理员',
        employee_id='ADMIN001',
        department='技术部',
        position='系统管理员',
        status='active',
        hourly_rate=100.00,
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

def init_database():
    """初始化数据库"""
    print("开始初始化数据库...")
    init_roles_and_permissions()
    create_admin_user()
    print("数据库初始化完成") 