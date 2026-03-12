export declare enum PolicyType {
    TERMS_CONDITIONS = "terms_conditions",
    PRIVACY_POLICY = "privacy_policy",
    SHIPPING_POLICY = "shipping_policy",
    REFUND_RETURN = "refund_return",
    COOKIE_POLICY = "cookie_policy",
    DISCLAIMER = "disclaimer"
}
export declare class Policy {
    id: number;
    type: PolicyType;
    content: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
