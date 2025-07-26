#!/usr/bin/env python3
"""
数据库初始化脚本
"""

import sys
import os

# 添加当前目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

try:
    from app import create_app
    from app.services.init_data import init_database
    
    print("开始初始化数据库...")
    
    app = create_app()
    with app.app_context():
        init_database()
    
    print("数据库初始化成功！")
    print("默认管理员账户:")
    print("用户名: admin")
    print("密码: admin123")
    
except Exception as e:
    print(f"数据库初始化失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1) 