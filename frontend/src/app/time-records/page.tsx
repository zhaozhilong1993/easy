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
  Statistic,
  Progress,
  Calendar,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  CheckOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { timeRecordAPI, projectAPI } from '@/services/api';
import MainLayout from '@/components/Layout/MainLayout';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';

const { Option } = Select;
const { TextArea } = Input;

interface TimeRecord {
  id: number;
  user: {
    id: number;
    name: string;
    username: string;
  };
  project: {
    id: number;
    name: string;
  };
  work_type: {
    id: number;
    name: string;
  };
  date: string;
  hours: number;
  description: string;
  status: string;
  approved_by?: {
    id: number;
    name: string;
  };
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

interface WorkType {
  id: number;
  name: string;
  description: string;
}

interface Project {
  id: number;
  name: string;
  status: string;
}

export default function TimeRecordsPage() {
  const { isAuthenticated, token } = useAuthStore();
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TimeRecord | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      console.log('TimeRecordsPage: fetching time records, work types and users');
      fetchTimeRecords();
      fetchWorkTypes();
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchTimeRecords = async () => {
    try {
      setLoading(true);
      const response = await timeRecordAPI.getTimeRecords();
      setTimeRecords(response.data);
    } catch (error) {
      message.error('获取工时记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkTypes = async () => {
    try {
      const response = await timeRecordAPI.getWorkTypes();
      setWorkTypes(response.data);
    } catch (error) {
      message.error('获取工作类型失败');
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getProjects();
      setProjects(response.data);
    } catch (error) {
      message.error('获取项目列表失败');
    }
  };

  const handleCreate = () => {
    setEditingRecord(null);
    form.resetFields();
    form.setFieldsValue({
      date: dayjs(),
    });
    setModalVisible(true);
  };

  const handleEdit = (record: TimeRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      project_id: record.project.id,
      work_type_id: record.work_type.id,
      date: dayjs(record.date),
      hours: record.hours,
      description: record.description,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await timeRecordAPI.deleteTimeRecord(id);
      message.success('删除成功');
      fetchTimeRecords();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await timeRecordAPI.approveTimeRecord(id);
      message.success('审批成功');
      fetchTimeRecords();
    } catch (error) {
      message.error('审批失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        await timeRecordAPI.updateTimeRecord(editingRecord.id, data);
        message.success('更新成功');
      } else {
        await timeRecordAPI.createTimeRecord(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTimeRecords();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'pending': '待审批',
      'approved': '已通过',
      'rejected': '已拒绝'
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '项目',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => (
        <span className="font-medium">{project.name}</span>
      ),
    },
    {
      title: '工作类型',
      dataIndex: 'work_type',
      key: 'work_type',
      render: (workType: any) => (
        <Tag color="blue">{workType.name}</Tag>
      ),
    },
    {
      title: '工时',
      dataIndex: 'hours',
      key: 'hours',
      render: (hours: number) => (
        <span className="font-medium text-blue-600">{hours}小时</span>
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: '审批人',
      dataIndex: 'approved_by',
      key: 'approved_by',
      render: (approvedBy: any) => 
        approvedBy ? (
          <div className="flex items-center">
            <span>{approvedBy.name}</span>
            <span className="text-gray-400 ml-2 text-xs">
              {dayjs(approvedBy.approved_at).format('MM-DD HH:mm')}
            </span>
          </div>
        ) : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_, record: TimeRecord) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="编辑">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(record)}
                />
              </Tooltip>
              <Tooltip title="审批">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                />
              </Tooltip>
            </>
          )}
          <Popconfirm
            title="确定要删除这条记录吗？"
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

  // 统计信息
  const totalHours = timeRecords.reduce((sum, record) => sum + record.hours, 0);
  const pendingCount = timeRecords.filter(record => record.status === 'pending').length;
  const approvedCount = timeRecords.filter(record => record.status === 'approved').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">工时记录</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
          >
            录入工时
          </Button>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card className="dashboard-card">
              <Statistic
                title="总工时"
                value={totalHours}
                suffix="小时"
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-card">
              <Statistic
                title="待审批"
                value={pendingCount}
                suffix="条"
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="dashboard-card">
              <Statistic
                title="已通过"
                value={approvedCount}
                suffix="条"
                prefix={<CheckOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        <Card className="dashboard-card">
          <Table
            columns={columns}
            dataSource={timeRecords}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Card>

        {/* 工时录入模态框 */}
        <Modal
          title={editingRecord ? '编辑工时记录' : '录入工时'}
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
                  name="project_id"
                  label="项目"
                  rules={[{ required: true, message: '请选择项目' }]}
                >
                  <Select placeholder="请选择项目">
                    {projects
                      .filter(project => project.status === 'active')
                      .map(project => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="work_type_id"
                  label="工作类型"
                  rules={[{ required: true, message: '请选择工作类型' }]}
                >
                  <Select placeholder="请选择工作类型">
                    {workTypes.map(workType => (
                      <Option key={workType.id} value={workType.id}>
                        {workType.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="date"
                  label="日期"
                  rules={[{ required: true, message: '请选择日期' }]}
                >
                  <DatePicker style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="hours"
                  label="工时"
                  rules={[{ required: true, message: '请输入工时' }]}
                >
                  <Input 
                    type="number" 
                    placeholder="请输入工时"
                    suffix="小时"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="工作描述"
              rules={[{ required: true, message: '请输入工作描述' }]}
            >
              <TextArea 
                rows={4} 
                placeholder="请详细描述今天的工作内容..."
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
                  {editingRecord ? '更新' : '提交'}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </MainLayout>
  );
} 