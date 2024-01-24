import { container } from 'tsyringe';

import { StreamingUseCase } from './StreamingUseCase';

class StreamingController {
  async handle(totalRecords: number) {
    await container.resolve(StreamingUseCase).execute(totalRecords);
  }
}

export { StreamingController };
