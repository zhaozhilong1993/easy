#!/bin/bash

echo "=== 研发成本统计系统 - 后端启动脚本 ==="

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到Python3，请先安装Python3"
    exit 1
fi

# 检查虚拟环境
if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "激活虚拟环境..."
source venv/bin/activate

echo "1. 安装依赖包..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "错误: 依赖包安装失败"
    exit 1
fi

echo "2. 检查环境变量文件..."
if [ ! -f .env ]; then
    echo "创建环境变量文件..."
    cp env.example .env
    echo "请编辑 .env 文件配置数据库连接等信息"
fi

echo "3. 初始化数据库..."
python3 init_db.py

if [ $? -ne 0 ]; then
    echo "错误: 数据库初始化失败"
    exit 1
fi

echo "4. 启动Flask服务..."
echo "服务将在 http://localhost:5000 启动"
echo "按 Ctrl+C 停止服务"
echo ""

python3 run.py 