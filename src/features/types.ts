export type BasicResponse<D> = {
  success: boolean
  error_msg: string
  data?: D
}

export type SignedUserAccount = {
  id: string // Used to refer the user
  user_name: string
  units: number
}

export type TransferUnitsRegistry = {
  from: string
  to: string
  units: number
}

export enum TransactionType {
  NONE = 'NONE',
  ACCOUNT = 'ACCOUNT',
  CONTRACT = 'CONTRACT',
  TRANSFER = 'TRANSFER',
}

export type ContractTransactionData<Model> = {
  tx_type: TransactionType
  contract_id: string
  timestamp?: number
  data: Model
  block_hash: string
  block_height: number
}
