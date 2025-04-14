export class CreateTransactionDto {
  sender: string;
  receivers: string;
  emailTemplateId?: number;
  body: string;
  plantDate?: Date;
  sendDate: Date;
  createdBy: string;
}
