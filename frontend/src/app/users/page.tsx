'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  message, 
  Popconfirm,
  Card,
  Row,
  Col,
  Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { userAPI, roleAPI } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/components/Layout/MainLayout';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  department: string;
  roles: Array<{
    id: number;
    name: string;
    description: string;
  }>;
  hourly_rate?: number;
  is_active: boolean;
  created_at: string;
}

export default function UsersPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('UsersPage: fetching users and roles');
      fetchUsers();
      fetchRoles();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getRoles();
      setRoles(response.data.roles || []);
    } catch (error) {
      message.error('获取角色列表失败');
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    // 处理角色数据，从roles数组中提取角色名称
    const formData = {
      ...user,
      roles: user.roles ? user.roles.map((role: any) => role.name) : []
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await userAPI.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      // 移除确认密码字段
      const { confirmPassword, ...submitData } = values;
      
      if (editingUser) {
        // 编辑时，如果没有输入密码则移除密码字段
        if (!submitData.password) {
          delete submitData.password;
        }
        await userAPI.updateUser(editingUser.id, submitData);
        message.success('更新成功');
      } else {
        await userAPI.createUser(submitData);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: any[]) => (
        <div className="flex flex-wrap gap-1">
          {roles && roles.map((role, index) => (
            <Tag key={index} color={role.name === 'admin' ? 'red' : role.name === 'manager' ? 'blue' : 'green'}>
              {role.name}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: '时薪',
      dataIndex: 'hourly_rate',
      key: 'hourly_rate',
      render: (rate: number) => rate ? `¥${rate}/h` : '-',
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div>
        <Row justify="space-between" align="middle" className="mb-4">
          <Col>
            <h1 className="text-2xl font-bold">用户管理</h1>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              新增用户
            </Button>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>

        <Modal
          title={editingUser ? '编辑用户' : '新增用户'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="用户名"
                  rules={[{ required: true, message: '请输入用户名' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="employee_id"
                  label="工号"
                  rules={[{ required: true, message: '请输入工号' }]}
                >
                  <Input placeholder="请输入工号" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="姓名"
                  rules={[{ required: true, message: '请输入姓名' }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="邮箱"
                  rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '请输入正确的邮箱格式' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="department"
                  label="部门"
                  rules={[{ required: true, message: '请选择部门' }]}
                >
                  <Select placeholder="请选择部门">
                    <Option value="技术部">技术部</Option>
                    <Option value="产品部">产品部</Option>
                    <Option value="设计部">设计部</Option>
                    <Option value="测试部">测试部</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="roles"
                  label="角色"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select 
                    mode="multiple"
                    placeholder="请选择角色"
                    optionFilterProp="children"
                  >
                    {roles.filter(role => role.is_active).map(role => (
                      <Option key={role.id} value={role.name}>
                        {role.name}
                        <span className="text-gray-400 ml-2">
                          ({role.description})
                        </span>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="密码"
                  rules={[
                    { required: !editingUser, message: '请输入密码' },
                    { min: 6, message: '密码至少6位' }
                  ]}
                >
                  <Input.Password placeholder={editingUser ? '留空则不修改' : '请输入密码'} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label="确认密码"
                  dependencies={['password']}
                  rules={[
                    { required: !editingUser, message: '请确认密码' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('两次输入的密码不一致'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder={editingUser ? '留空则不修改' : '请确认密码'} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="hourly_rate"
                  label="时薪"
                >
                  <Input type="number" placeholder="请输入时薪" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="is_active"
                  label="状态"
                  valuePropName="checked"
                >
                  <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="is_active"
              label="状态"
              valuePropName="checked"
            >
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingUser ? '更新' : '创建'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
} 