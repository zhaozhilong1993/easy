import os
from app import create_app
from app.services.init_data import init_database

app = create_app()

@app.cli.command('init-db')
def init_db():
    """初始化数据库"""
    with app.app_context():
        init_database()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001) 