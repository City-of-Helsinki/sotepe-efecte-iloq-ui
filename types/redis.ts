export interface RedisKeyValue {
  key: string
  value: string
}

export interface RedisKeyData {
  name: string
  id: string
  realEstate?: string
  [key: string]: any
}

export interface RedisAPIResponse {
  success?: boolean
  error?: string
  key?: string
  value?: string
  keys?: string[]
  results?: RedisKeyValue[]
}
