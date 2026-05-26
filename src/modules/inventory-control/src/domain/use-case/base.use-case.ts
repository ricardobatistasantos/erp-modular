export interface BaseUseCase<Input, Output> {
  execute(data: Input): Promise<Output>;
}
