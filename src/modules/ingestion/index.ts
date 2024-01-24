import { container } from 'tsyringe';

import { GetTotalRecordsController } from './useCases/getTotalRecords/GetTotalRecordsController';
import { StreamingController } from './useCases/streaming/StreamingController';
import { ValidateSourceParametrizationController } from './useCases/validateSourceParametrization/ValidateSourceParametrizationController';
import { ValidateTargetParametrizationController } from './useCases/validateTargetParametrization/ValidateTargetParametrizationController';

class IngestionModule {
  async run() {
    await container.resolve(ValidateSourceParametrizationController).handle();
    await container.resolve(ValidateTargetParametrizationController).handle();
    const totalRecords = await container
      .resolve(GetTotalRecordsController)
      .handle();
    await container.resolve(StreamingController).handle(totalRecords);
  }
}

export { IngestionModule };
