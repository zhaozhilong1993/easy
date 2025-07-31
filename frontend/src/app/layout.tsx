import type { Metadata } from 'next'
import './globals.css'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export const metadata: Metadata = {
  title: '研发成本统计系统',
  description: '企业研发成本管理和统计分析平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ConfigProvider locale={zhCN}>
          {children}
        </ConfigProvider>
      </body>
    </html>
  )
} 