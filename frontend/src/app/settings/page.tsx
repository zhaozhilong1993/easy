'use client';
import { useState, useEffect } from 'react';
import { 
  Tabs, 
  Card, 
  Form, 
  Input, 
  Select, 
  Switch, 
  Button, 
  message, 
  Row, 
  Col,
  Divider,
  List,
  Avatar,
  Tag,
  Space,
  Tooltip,
  Modal,
  Upload,
  Progress,
  Alert
} from 'antd';
import { 
  SettingOutlined,
  UserOutlined,
  LockOutlined,
  DatabaseOutlined,
  CloudUploadOutlined,
  DownloadOutlined,
  SaveOutlined,
  ReloadOutlined,
  SecurityScanOutlined,
  BellOutlined
} from '@ant-design/icons';
import MainLayout from '@/components/Layout/MainLayout';

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface SystemConfig {
  site_name: string;
  site_description: string;
  admin_email: string;
  timezone: string;
  date_format: string;
  language: string;
  maintenance_mode: boolean;
  debug_mode: boolean;
  max_upload_size: number;
  session_timeout: number;
}

interface SecurityConfig {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_symbols: boolean;
  login_attempts_limit: number;
  lockout_duration: number;
  session_timeout: number;
  enable_2fa: boolean;
  enable_captcha: boolean;
}

interface BackupConfig {
  auto_backup: boolean;
  backup_frequency: string;
  backup_retention_days: number;
  backup_location: string;
  include_files: boolean;
  include_database: boolean;
}

export default function SettingsPage() {
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    site_name: '研发成本统计系统',
    site_description: '企业研发成本管理和统计分析平台',
    admin_email: 'admin@example.com',
    timezone: 'Asia/Shanghai',
    date_format: 'YYYY-MM-DD',
    language: 'zh-CN',
    maintenance_mode: false,
    debug_mode: false,
    max_upload_size: 10,
    session_timeout: 30,
  });

  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>({
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_symbols: false,
    login_attempts_limit: 5,
    lockout_duration: 30,
    session_timeout: 30,
    enable_2fa: false,
    enable_captcha: true,
  });

  const [backupConfig, setBackupConfig] = useState<BackupConfig>({
    auto_backup: true,
    backup_frequency: 'daily',
    backup_retention_days: 30,
    backup_location: '/backups',
    include_files: true,
    include_database: true,
  });

  const [systemForm] = Form.useForm();
  const [securityForm] = Form.useForm();
  const [backupForm] = Form.useForm();

  useEffect(() => {
    // 初始化表单数据
    systemForm.setFieldsValue(systemConfig);
    securityForm.setFieldsValue(securityConfig);
    backupForm.setFieldsValue(backupConfig);
  }, []);

  const handleSystemSave = async (values: SystemConfig) => {
    try {
      setSystemConfig(values);
      message.success('系统配置保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleSecuritySave = async (values: SecurityConfig) => {
    try {
      setSecurityConfig(values);
      message.success('安全配置保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleBackupSave = async (values: BackupConfig) => {
    try {
      setBackupConfig(values);
      message.success('备份配置保存成功');
    } catch (error) {
      message.error('保存失败');
    }
  };

  const handleManualBackup = () => {
    Modal.confirm({
      title: '确认备份',
      content: '确定要立即执行数据备份吗？',
      onOk: () => {
        message.success('备份任务已启动，请稍后查看备份状态');
      },
    });
  };

  const handleRestoreBackup = () => {
    Modal.confirm({
      title: '确认恢复',
      content: '确定要恢复数据吗？这将覆盖当前数据！',
      onOk: () => {
        message.success('数据恢复任务已启动');
      },
    });
  };

  const backupHistory = [
    {
      id: 1,
      filename: 'backup_2025-01-26_14-30-00.zip',
      size: '256MB',
      type: '完整备份',
      status: 'completed',
      created_at: '2025-01-26 14:30:00',
    },
    {
      id: 2,
      filename: 'backup_2025-01-25_14-30-00.zip',
      size: '248MB',
      type: '完整备份',
      status: 'completed',
      created_at: '2025-01-25 14:30:00',
    },
    {
      id: 3,
      filename: 'backup_2025-01-24_14-30-00.zip',
      size: '252MB',
      type: '完整备份',
      status: 'completed',
      created_at: '2025-01-24 14:30:00',
    },
  ];

  const systemInfo = [
    { label: '系统版本', value: 'v1.0.0' },
    { label: 'PHP版本', value: '8.1.0' },
    { label: '数据库版本', value: 'MySQL 8.0' },
    { label: '服务器环境', value: 'Apache 2.4' },
    { label: '磁盘使用率', value: '45%' },
    { label: '内存使用率', value: '62%' },
    { label: 'CPU使用率', value: '28%' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">系统设置</h1>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Tabs defaultActiveKey="system">
          <TabPane tab="系统配置" key="system">
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Card className="dashboard-card">
                  <Form
                    form={systemForm}
                    layout="vertical"
                    onFinish={handleSystemSave}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="site_name"
                          label="系统名称"
                          rules={[{ required: true, message: '请输入系统名称' }]}
                        >
                          <Input placeholder="请输入系统名称" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="admin_email"
                          label="管理员邮箱"
                          rules={[
                            { required: true, message: '请输入管理员邮箱' },
                            { type: 'email', message: '请输入正确的邮箱格式' }
                          ]}
                        >
                          <Input placeholder="请输入管理员邮箱" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="site_description"
                      label="系统描述"
                    >
                      <TextArea 
                        rows={3} 
                        placeholder="请输入系统描述"
                      />
                    </Form.Item>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="timezone"
                          label="时区设置"
                        >
                          <Select placeholder="请选择时区">
                            <Option value="Asia/Shanghai">Asia/Shanghai</Option>
                            <Option value="UTC">UTC</Option>
                            <Option value="America/New_York">America/New_York</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="date_format"
                          label="日期格式"
                        >
                          <Select placeholder="请选择日期格式">
                            <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                            <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                            <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="language"
                          label="系统语言"
                        >
                          <Select placeholder="请选择语言">
                            <Option value="zh-CN">简体中文</Option>
                            <Option value="en-US">English</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          name="max_upload_size"
                          label="最大上传大小 (MB)"
                        >
                          <Input type="number" min={1} max={100} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="session_timeout"
                          label="会话超时 (分钟)"
                        >
                          <Input type="number" min={5} max={480} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          name="maintenance_mode"
                          label="维护模式"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="debug_mode"
                      label="调试模式"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 border-0"
                      >
                        保存配置
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card className="dashboard-card" title="系统信息">
                  <List
                    dataSource={systemInfo}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="flex justify-between w-full">
                          <span className="text-gray-600">{item.label}</span>
                          <span className="font-medium">{item.value}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="安全设置" key="security">
            <Card className="dashboard-card">
              <Form
                form={securityForm}
                layout="vertical"
                onFinish={handleSecuritySave}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="password_min_length"
                      label="密码最小长度"
                    >
                      <Input type="number" min={6} max={20} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="login_attempts_limit"
                      label="登录尝试次数限制"
                    >
                      <Input type="number" min={3} max={10} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="lockout_duration"
                      label="锁定时间 (分钟)"
                    >
                      <Input type="number" min={5} max={1440} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="session_timeout"
                      label="会话超时 (分钟)"
                    >
                      <Input type="number" min={5} max={480} />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>密码策略</Divider>

                <Row gutter={16}>
                  <Col span={6}>
                    <Form.Item
                      name="password_require_uppercase"
                      label="要求大写字母"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="password_require_lowercase"
                      label="要求小写字母"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="password_require_numbers"
                      label="要求数字"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item
                      name="password_require_symbols"
                      label="要求特殊字符"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider>高级安全</Divider>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="enable_2fa"
                      label="启用双因素认证"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="enable_captcha"
                      label="启用验证码"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    className="bg-gradient-to-r from-green-500 to-blue-600 border-0"
                  >
                    保存安全配置
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          <TabPane tab="数据备份" key="backup">
            <Row gutter={16}>
              <Col xs={24} lg={16}>
                <Card className="dashboard-card" title="备份配置">
                  <Form
                    form={backupForm}
                    layout="vertical"
                    onFinish={handleBackupSave}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="auto_backup"
                          label="自动备份"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="backup_frequency"
                          label="备份频率"
                        >
                          <Select placeholder="请选择备份频率">
                            <Option value="daily">每日</Option>
                            <Option value="weekly">每周</Option>
                            <Option value="monthly">每月</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="backup_retention_days"
                          label="保留天数"
                        >
                          <Input type="number" min={1} max={365} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="backup_location"
                          label="备份位置"
                        >
                          <Input placeholder="请输入备份路径" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="include_files"
                          label="包含文件"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="include_database"
                          label="包含数据库"
                          valuePropName="checked"
                        >
                          <Switch />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item>
                      <Space>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          className="bg-gradient-to-r from-purple-500 to-pink-600 border-0"
                        >
                          保存备份配置
                        </Button>
                        <Button 
                          type="primary"
                          icon={<CloudUploadOutlined />}
                          onClick={handleManualBackup}
                          className="bg-gradient-to-r from-blue-500 to-green-600 border-0"
                        >
                          立即备份
                        </Button>
                        <Button 
                          type="default"
                          icon={<DownloadOutlined />}
                          onClick={handleRestoreBackup}
                        >
                          恢复数据
                        </Button>
                      </Space>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card className="dashboard-card" title="备份历史">
                  <List
                    dataSource={backupHistory}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<DatabaseOutlined />} />}
                          title={item.filename}
                          description={
                            <div>
                              <div className="text-sm text-gray-500">
                                {item.created_at} • {item.size}
                              </div>
                              <div className="mt-1">
                                <Tag color="blue">{item.type}</Tag>
                                <Tag color="green">{item.status}</Tag>
                              </div>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="系统监控" key="monitor">
            <Row gutter={16}>
              <Col xs={24} lg={12}>
                <Card className="dashboard-card" title="系统资源">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>CPU使用率</span>
                        <span>28%</span>
                      </div>
                      <Progress percent={28} strokeColor="#1890ff" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>内存使用率</span>
                        <span>62%</span>
                      </div>
                      <Progress percent={62} strokeColor="#52c41a" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>磁盘使用率</span>
                        <span>45%</span>
                      </div>
                      <Progress percent={45} strokeColor="#faad14" />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span>网络使用率</span>
                        <span>18%</span>
                      </div>
                      <Progress percent={18} strokeColor="#f5222d" />
                    </div>
                  </div>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card className="dashboard-card" title="系统日志">
                  <List
                    size="small"
                    dataSource={[
                      { time: '14:30:25', level: 'INFO', message: '用户登录成功' },
                      { time: '14:28:15', level: 'WARN', message: '数据库连接池使用率较高' },
                      { time: '14:25:42', level: 'INFO', message: '自动备份任务完成' },
                      { time: '14:22:18', level: 'ERROR', message: '文件上传失败' },
                      { time: '14:20:05', level: 'INFO', message: '系统配置更新' },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <div className="flex items-center w-full">
                          <span className="text-gray-500 text-xs w-16">{item.time}</span>
                          <Tag 
                            color={item.level === 'ERROR' ? 'red' : item.level === 'WARN' ? 'orange' : 'green'}
                            size="small"
                            className="mx-2"
                          >
                            {item.level}
                          </Tag>
                          <span className="text-sm flex-1">{item.message}</span>
                        </div>
                      </List.Item>
                    )}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </div>
    </MainLayout>
  );
} 