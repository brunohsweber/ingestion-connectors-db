import { join } from 'path';

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

import { ProtoGrpcType } from './types/connectors_communication';

const getClient = () => {
  const packageDefinition = protoLoader.loadSync(
    join(__dirname, 'proto', 'connectors_communication.proto'),
  );

  const proto = grpc.loadPackageDefinition(
    packageDefinition,
  ) as unknown as ProtoGrpcType;

  const client =
    new proto.connectors_communication_package.ConnectorsCommunication(
      'localhost:50051',
      grpc.credentials.createInsecure(),
    );

  return client;
};

export default getClient();
