import axios, { AxiosInstance, AxiosResponse } from 'axios'

export interface WallGuardApiConfig {
  token: string
  baseUrl?: string
  apiVersion?: string
  serverDomain?: string
}

export interface EnableMonitoringRequest {
  device_id: string
  instance_id: string
  enable: boolean
}

export interface RemoteAccessRequest {
  device_id: string
  instance_id: string
  session_type: 'ssh' | 'tty'
}

export interface AuthorizeDeviceRequest {
  device_id: string
}

export interface FilterRule {
  disabled: boolean
  policy: 'pass' | 'block'
  protocol: string
  source_inversed: boolean
  source_port: string
  source_addr: string
  source_type: 'ip' | 'network'
  destination_inversed: boolean
  destination_port: string
  destination_addr: string
  destination_type: 'ip' | 'network'
  description: string
  interface: string
  id: number
  order: number
  associated_rule_id: string
}

export interface CreateFilterRuleRequest {
  device_id: string
  instance_id: string
  rule: FilterRule
}

export interface RemoteAccessSession {
  session_token: string
  session_type: string
  expires_at: string
}

export class WallGuardApi {
  private client: AxiosInstance
  private config: WallGuardApiConfig

  constructor(config: WallGuardApiConfig) {
    this.config = {
      baseUrl: config.baseUrl || process.env.NEXT_PUBLIC_REMOTE_ACCESS_API_URL || 'https://wallguard-proxy.nullnet.dnaqa.net',
      apiVersion: config.apiVersion || 'v1',
      token: config.token,
      serverDomain: config.serverDomain || process.env.NEXT_PUBLIC_WG_SERVER_DOMAIN || 'nullnet.com'
    }
    
    console.log('@@@ this.config', this.config)
    
    this.client = axios.create({
      baseURL: `${this.config.baseUrl}/wallguard/api/${this.config.apiVersion}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.token}`
      }
    })
  }

  // Monitoring Endpoints
  async enableTrafficMonitoring(request: EnableMonitoringRequest): Promise<AxiosResponse> {
    return this.client.post('/enable_traffic_monitoring', request)
  }

  async enableTelemetryMonitoring(request: EnableMonitoringRequest): Promise<AxiosResponse> {
    return this.client.post('/enable_telemetry_monitoring', request)
  }

  async enableConfigurationMonitoring(request: EnableMonitoringRequest): Promise<AxiosResponse> {
    return this.client.post('/enable_config_monitoring', request)
  }

  // Remote Access Endpoints
  async requestRemoteAccess(request: RemoteAccessRequest): Promise<AxiosResponse<RemoteAccessSession>> {
    return this.client.post('/remote_access', request)
  }

  getSshWebSocketUrl(sessionToken: string): string {
    return `ws://${sessionToken}.${this.config.serverDomain || 'nullnet.com'}/wallguard/gateway/ssh`
  }

  getTtyWebSocketUrl(sessionToken: string): string {
    return `ws://${sessionToken}.${this.config.serverDomain || 'nullnet.com'}/wallguard/gateway/tty`
  }

  getUiProxyUrl(sessionToken: string): string {
    return `http://${sessionToken}.${this.config.serverDomain || 'nullnet.com'}/`
  }

  // Device Management Endpoints
  async authorizeDevice(request: AuthorizeDeviceRequest): Promise<AxiosResponse> {
    return this.client.post('/authorize_device', request)
  }

  // Filter Rules Endpoints
  async createFilterRule(request: CreateFilterRuleRequest): Promise<AxiosResponse> {
    return this.client.post('/wallguard/rule/filter', request)
  }

  // Utility method to update token
  setToken(token: string): void {
    this.config.token = token
    this.client.defaults.headers['Authorization'] = `Bearer ${token}`
  }

  // Utility method to update base URL
  setBaseUrl(baseUrl: string): void {
    this.config.baseUrl = baseUrl
    this.client.defaults.baseURL = `${baseUrl}/wallguard/api/${this.config.apiVersion}`
  }
}