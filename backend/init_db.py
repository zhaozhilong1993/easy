#!/usr/bin/env python3
"""
数据库初始化脚本
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.services.init_data import init_database

app = create_app()

def init_db():
    """初始化数据库"""
    with app.app_context():
        print("开始创建数据库表...")
        db.create_all()
        print("数据库表创建完成")
        
        print("开始初始化数据...")
        init_database()
        print("数据初始化完成")

if __name__ == '__main__':
    init_db() 