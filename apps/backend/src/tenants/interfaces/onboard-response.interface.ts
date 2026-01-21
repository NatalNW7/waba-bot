/**
 * Response interface for the consolidated onboarding endpoint
 */
export interface OnboardResponse {
  tenant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    saasPlanId: string;
    saasStatus: string;
  };
  subscription?: {
    initPoint?: string;
    externalId?: string;
  };
}
