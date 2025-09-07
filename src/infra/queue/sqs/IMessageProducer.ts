export interface IMessageProducer {
  send(message: any): Promise<string | undefined>;
}
