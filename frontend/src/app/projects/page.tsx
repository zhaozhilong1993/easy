'use client';
import { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Popconfirm, 
  message, 
  Card, 
  Row, 
  Col,
  Tag,
  Space,
  Tooltip,
  Progress,
  Avatar,
  List
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  TeamOutlined,
  UserAddOutlined,
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import { projectAPI, userAPI } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface Project {
  id: number;
  name: string;
  code: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  budget: number;
  used_budget?: number;
  progress: number;
  manager_id: number;
  manager_name: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export default function ProjectsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const [memberForm] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('ProjectsPage: fetching projects and users');
      fetchProjects();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectAPI.getProjects();
      setProjects(response.data.projects || response.data || []);
    } catch (error) {
      message.error('获取项目列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      message.error('获取用户列表失败');
    }
  };

  const fetchProjectMembers = async (projectId: number) => {
    try {
      const response = await projectAPI.getProjectMembers(projectId);
      setMembers(response.data.members || []);
    } catch (error) {
      message.error('获取项目成员失败');
      setMembers([]);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Project) => {
    setEditingProject(record);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      status: record.status,
      start_date: dayjs(record.start_date),
      end_date: dayjs(record.end_date),
      budget: record.budget,
      manager_id: record.manager_id
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await projectAPI.deleteProject(id);
      message.success('删除成功');
      fetchProjects();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      };

      if (editingProject) {
        await projectAPI.updateProject(editingProject.id, data);
        message.success('更新成功');
      } else {
        await projectAPI.createProject(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchProjects();
    } catch (error) {
      message.error(editingProject ? '更新失败' : '创建失败');
    }
  };

  const handleManageMembers = (project: Project) => {
    setCurrentProject(project);
    fetchProjectMembers(project.id); // Fetch members for the current project
    setMemberModalVisible(true);
  };

  const handleAddMember = async (values: any) => {
    try {
      await projectAPI.addProjectMember(currentProject!.id, values);
      message.success('添加成员成功');
      fetchProjects();
      setMemberModalVisible(false);
    } catch (error) {
      message.error('添加成员失败');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await projectAPI.removeProjectMember(currentProject!.id, userId);
      message.success('移除成员成功');
      fetchProjects();
    } catch (error) {
      message.error('移除成员失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'planning': 'blue',
      'active': 'green',
      'completed': 'purple',
      'paused': 'orange',
      'cancelled': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'planning': '计划中',
      'active': '进行中',
      'completed': '已完成',
      'paused': '暂停',
      'cancelled': '已取消'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <span className="font-medium">{text}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <div className="w-32">
          <Progress percent={progress} size="small" />
        </div>
      ),
    },
    {
      title: '项目经理',
      dataIndex: 'manager_name',
      key: 'manager_name',
      render: (managerName: string) => (
        <div className="flex items-center">
          <Avatar size="small" className="mr-2">
            {managerName?.charAt(0) || '?'}
          </Avatar>
          <span>{managerName || '未分配'}</span>
        </div>
      ),
    },
    {
      title: '预算',
      dataIndex: 'budget',
      key: 'budget',
      render: (budget: number) => (
        <span className="text-green-600 font-medium">
          ¥{budget.toLocaleString()}
        </span>
      ),
    },
    {
      title: '时间',
      key: 'date_range',
      render: (_, record: Project) => (
        <div className="text-sm text-gray-500">
          <div>{dayjs(record.start_date).format('YYYY-MM-DD')}</div>
          <div>至 {dayjs(record.end_date).format('YYYY-MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '成员',
      dataIndex: 'member_count',
      key: 'member_count',
      render: (memberCount: number) => (
        <div className="flex items-center">
          <Avatar.Group maxCount={3} size="small">
            {/* 这里可以显示成员头像，如果有成员数据的话 */}
          </Avatar.Group>
          <span className="ml-2 text-sm text-gray-500">
            {memberCount || 0}人
          </span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: Project) => (
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="成员管理">
            <Button
              type="text"
              icon={<TeamOutlined />}
              onClick={() => handleManageMembers(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个项目吗？"
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
          <h1 className="text-2xl font-bold text-gray-800">项目管理</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            创建项目
          </Button>
        </div>

        <Card className="dashboard-card">
          <Table
            columns={columns}
            dataSource={projects}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>

        {/* 项目表单模态框 */}
        <Modal
          title={editingProject ? '编辑项目' : '创建项目'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={700}
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
                  label="项目名称"
                  rules={[{ required: true, message: '请输入项目名称' }]}
                >
                  <Input placeholder="请输入项目名称" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="code"
                  label="项目编号"
                  rules={[{ required: true, message: '请输入项目编号' }]}
                >
                  <Input placeholder="请输入项目编号" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="项目状态"
                  rules={[{ required: true, message: '请选择项目状态' }]}
                >
                  <Select placeholder="请选择项目状态">
                    <Option value="planning">计划中</Option>
                    <Option value="active">进行中</Option>
                    <Option value="completed">已完成</Option>
                    <Option value="paused">暂停</Option>
                    <Option value="cancelled">已取消</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="start_date"
                  label="开始日期"
                  rules={[{ required: true, message: '请选择开始日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="end_date"
                  label="结束日期"
                  rules={[{ required: true, message: '请选择结束日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="budget"
                  label="项目预算"
                  rules={[{ required: true, message: '请输入项目预算' }]}
                >
                  <Input 
                    type="number" 
                    placeholder="请输入项目预算"
                    prefix={<DollarOutlined />}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="manager_id"
                  label="项目经理"
                  rules={[{ required: true, message: '请选择项目经理' }]}
                >
                  <Select placeholder="请选择项目经理">
                    {users.map(user => (
                      <Option key={user.id} value={user.id}>
                        {user.name} ({user.username})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="项目描述"
              rules={[{ required: true, message: '请输入项目描述' }]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="请输入项目描述"
              />
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
                  {editingProject ? '更新' : '创建'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>

        {/* 成员管理模态框 */}
        <Modal
          title={`成员管理 - ${currentProject?.name}`}
          open={memberModalVisible}
          onCancel={() => setMemberModalVisible(false)}
          footer={null}
          width={600}
        >
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">当前成员</h4>
              <List
                dataSource={members}
                renderItem={(member) => (
                  <List.Item
                    actions={[
                      <Popconfirm
                        title="确定要移除这个成员吗？"
                        onConfirm={() => handleRemoveMember(member.user_id)}
                        okText="确定"
                        cancelText="取消"
                      >
                        <Button type="text" danger size="small">
                          移除
                        </Button>
                      </Popconfirm>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<Avatar>{member.user_name?.charAt(0) || '?'}</Avatar>}
                      title={member.user_name}
                      description={`${member.user_username} - ${member.role}`}
                    />
                  </List.Item>
                )}
              />
            </div>

            <div>
              <h4 className="font-medium mb-2">添加成员</h4>
              <Form
                form={memberForm}
                layout="inline"
                onFinish={handleAddMember}
              >
                <Form.Item
                  name="user_id"
                  rules={[{ required: true, message: '请选择用户' }]}
                >
                  <Select 
                    placeholder="选择用户" 
                    style={{ width: 200 }}
                    showSearch
                    optionFilterProp="children"
                  >
                    {users
                      .filter(user => !members.some(m => m.user_id === user.id))
                      .map(user => (
                        <Option key={user.id} value={user.id}>
                          {user.name} ({user.username})
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Select placeholder="选择角色" style={{ width: 120 }}>
                    <Option value="developer">开发人员</Option>
                    <Option value="tester">测试人员</Option>
                    <Option value="designer">设计师</Option>
                    <Option value="manager">项目经理</Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<UserAddOutlined />}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                  >
                    添加
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
} 