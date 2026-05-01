export declare class QuotationRecord {
    id: number;
    customer_id: number;
    customer: string;
    mobile: string;
    comment: string;
    comment2: string;
    address: string;
    total: number;
    tax: number;
    tax_type: string;
    total_tax: number;
    total_cost: number;
    all_total: number;
    discount: number;
    percentage_discount: number;
    discount_amount: number;
    amount_paid: number;
    balance: number;
    staff: string;
    currency: string;
    currency_symbol: string;
    date: string;
    status: number;
    view: number;
}
export declare class QuotationItemRecord {
    id: number;
    quote_id: number;
    customer_id: number;
    sale_status: number;
    product_id: number;
    product_name: string;
    unit_price: number;
    quantity: number;
    measure: string;
    sub_total: number;
    unit_buying: number;
    sub_buying: number;
    details: string;
    image: string;
    staff: string;
    date: string;
}
