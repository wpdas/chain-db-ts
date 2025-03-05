export type BasicResponse<D> = {
  success: boolean
  message: string
  data?: D
}

export type Connection = {
  server: string | null
  database: string
  user: string
  password: string
}

export type Criteria<Model> = Partial<Record<keyof Model, string | number | boolean>>

export type CriteriaAdvanced<Model> = {
  field: Partial<keyof Model>
  /**
   * @see Operators
   */
  operator: string
  value: string | number | boolean
}

/**
 * Operators for the advanced criteria
 * @see https://docs.chaindb.com/docs/query-language/ (TODO)
 */
export const Operators = {
  // (==)
  EQUAL: 'Eq',
  // (!=)
  NOT_EQUAL: 'Ne',
  // (>)
  GREATER_THAN: 'Gt',
  // (>=)
  GREATER_THAN_OR_EQUAL: 'Ge',
  // (<)
  LESS_THAN: 'Lt',
  // (<=)
  LESS_THAN_OR_EQUAL: 'Le',
  // (for strings and arrays)
  CONTAINS: 'Contains',
  // (for strings)
  STARTS_WITH: 'StartsWith',
  // (for strings)
  ENDS_WITH: 'EndsWith',
}

// Events
export const EventTypes = {
  TABLE_PERSIST: 'TablePersist',
  TABLE_UPDATE: 'TableUpdate',
}

export type EventData = {
  event_type: string
  database: string
  table: string
  /**
   * Data of the event (also to/from the table)
   */
  data: Record<string, any>
  /**
   * Timestamp of the event
   */
  timestamp: number
}

export type EventCallback = (data: EventData) => void
