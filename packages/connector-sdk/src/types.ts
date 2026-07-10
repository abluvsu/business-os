export interface IKnowledgeSourceProvider<
  TConfig = any,
  TRawPayload = any,
  TNormalizedData = any,
> {
  config: {
    connectorId: string;
    displayName: string;
  };
  authenticate(credentials: unknown): Promise<TConfig>;
  discover(authContext: TConfig): Promise<unknown>;
  sync(authContext: TConfig, lastSyncAt?: Date): Promise<TRawPayload>;
  normalize(rawPayload: TRawPayload): Promise<TNormalizedData>;
  validate(normalizedData: TNormalizedData): Promise<boolean>;
  persist(db: any, normalizedData: TNormalizedData): Promise<void>;
}
