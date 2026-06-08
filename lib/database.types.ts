export type Tier = "free" | "basic" | "true" | "true_plus";

export type PurchaseStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "unpaid"
  | "trialing"
  | "paused";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          discord_id: string;
          discord_username: string;
          discord_avatar: string | null;
          minecraft_username: string | null;
          tier: Tier;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          discord_id: string;
          discord_username: string;
          discord_avatar?: string | null;
          minecraft_username?: string | null;
          tier?: Tier;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          discord_username?: string;
          discord_avatar?: string | null;
          minecraft_username?: string | null;
          tier?: Tier;
          updated_at?: string;
        };
        Relationships: [];
      };
      purchases: {
        Row: {
          id: string;
          user_id: string;
          tier: Exclude<Tier, "free">;
          stripe_customer_id: string;
          stripe_price_id: string;
          status: PurchaseStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tier: Exclude<Tier, "free">;
          stripe_customer_id: string;
          stripe_price_id: string;
          status?: PurchaseStatus;
          created_at?: string;
        };
        Update: {
          status?: PurchaseStatus;
        };
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
