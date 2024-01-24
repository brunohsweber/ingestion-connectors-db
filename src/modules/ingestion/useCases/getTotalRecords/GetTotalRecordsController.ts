import { container } from 'tsyringe';

import { GetTotalRecordsUseCase } from './GetTotalRecordsUseCase';

class GetTotalRecordsController {
  async handle() {
    const totalRecords = await container
      .resolve(GetTotalRecordsUseCase)
      .execute();

    return totalRecords;
  }
}

export { GetTotalRecordsController };
