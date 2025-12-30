export interface BaseUseCase<I, O> {
  execute(data: I): Promise<O>;
}
