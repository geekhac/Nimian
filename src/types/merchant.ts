export interface Merchant {
  id: string;
  nickname: string;
  contact: string;
  total_orders: number;
  total_amount: number;
  problematic_orders: number;
  problematic_amount: number;
  joined_at: string;
  created_at?: string;
  updated_at?: string;
}