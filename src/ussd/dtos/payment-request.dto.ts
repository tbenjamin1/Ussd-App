import { Pricing } from "../entities/pricing.entity";
import { Event } from "../entities/event.entity";

export class PaymentRequestDto {
  phoneNumber: string;
  pricing: Pricing;
  event: Event;
  transactionId: string;
  names: string;
  tickets: number;
}
