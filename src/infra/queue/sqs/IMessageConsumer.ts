export interface IPollingOptions {
  maxNumberOfMessages?: number;
  waitTimeSeconds?: number;
  pollInterval?: number;
}

export interface IMessageConsumer {
  startPolling(
    messageHandler: (message: any) => Promise<void>,
    options?: IPollingOptions
  ): Promise<void>;
  stopPolling(): void;
}
