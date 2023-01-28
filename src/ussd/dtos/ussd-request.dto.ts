export interface UssdRequestDTO {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
  response?: string;
  action?: string;
  requestTime?: string;
  metadata?: any;
}
