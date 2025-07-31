'use client';
import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Popconfirm, 
  message, 
  Card, 
  Row, 
  Col,
  Tag,
  Space,
  Tooltip
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { roleAPI } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import { useAuthStore } from '@/stores/auth';

const { Option } = Select;

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: number;
  name: string;
  description: string;
  resource: string;
  action: string;
}

export default function RolesPage() {
  const { isAuthenticated } = useAuthStore();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [form] = Form.useForm();

  // 初始化permissions为空数组，避免运行时错误
  useEffect(() => {
    setPermissions([]);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('RolesPage: fetching roles');
      fetchRoles();
      fetchPermissions();
    }
  }, [isAuthenticated]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      console.log('RolesPage: calling fetchRoles API');
      const response = await roleAPI.getRoles();
      console.log('RolesPage: fetchRoles response:', response.data);
      // 后端返回格式是 {roles: [...]}，需要提取roles数组
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error('RolesPage: fetchRoles error:', error);
      message.error('获取角色列表失败');
      setRoles([]); // 设置默认空数组
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      console.log('RolesPage: calling fetchPermissions API');
      const response = await roleAPI.getPermissions();
      console.log('RolesPage: fetchPermissions response:', response.data);
      // 后端返回格式是 {permissions: [...]}，需要提取permissions数组
      const permissionsData = response.data.permissions || [];
      console.log('RolesPage: setting permissions:', permissionsData.length, 'permissions');
      setPermissions(permissionsData);
    } catch (error) {
      console.error('RolesPage: fetchPermissions error:', error);
      message.error('获取权限列表失败');
      setPermissions([]); // 设置默认空数组
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Role) => {
    setEditingRole(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      permissions: record.permissions || [],
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await roleAPI.deleteRole(id);
      message.success('删除成功');
      fetchRoles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggleStatus = async (role: Role) => {
    try {
      await roleAPI.updateRole(role.id, {
        ...role,
        is_active: !role.is_active
      });
      message.success(role.is_active ? '角色已禁用' : '角色已启用');
      fetchRoles();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRole) {
        await roleAPI.updateRole(editingRole.id, values);
        message.success('更新成功');
      } else {
        await roleAPI.createRole(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error) {
      message.error(editingRole ? '更新失败' : '创建失败');
    }
  };

  const columns = [
    {
      title: '角色名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {(permissions || []).slice(0, 3).map((permission, index) => (
            <Tag key={index} color="blue" size="small">
              {permission}
            </Tag>
          ))}
          {(permissions || []).length > 3 && (
            <Tag color="default" size="small">
              +{(permissions || []).length - 3}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: Role) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record)}
          checkedChildren="启用"
          unCheckedChildren="禁用"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Role) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个角色吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">角色管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            创建角色
          </Button>
        </div>

        <Card className="dashboard-card">
          <Table
            columns={columns}
            dataSource={roles}
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
          title={editingRole ? '编辑角色' : '创建角色'}
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
                  name="name"
                  label="角色名称"
                  rules={[{ required: true, message: '请输入角色名称' }]}
                >
                  <Input placeholder="请输入角色名称" />
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
              name="description"
              label="描述"
              rules={[{ required: true, message: '请输入角色描述' }]}
            >
              <Input.TextArea 
                rows={3} 
                placeholder="请输入角色描述"
              />
            </Form.Item>

            <Form.Item
              name="permissions"
              label="权限"
              rules={[{ required: true, message: '请选择权限' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择权限"
                optionFilterProp="children"
              >
                {console.log('RolesPage: rendering permissions:', permissions.length)}
                {(permissions || []).map(permission => (
                  <Option key={permission.id} value={permission.name}>
                    <div className="flex items-center">
                      <SettingOutlined className="mr-2" />
                      {permission.name}
                      <span className="text-gray-400 ml-2">
                        ({permission.resource})
                      </span>
                    </div>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item className="mb-0">
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                >
                  {editingRole ? '更新' : '创建'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
} 