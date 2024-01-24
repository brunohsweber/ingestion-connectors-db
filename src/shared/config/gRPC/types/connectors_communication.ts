import type * as grpc from '@grpc/grpc-js';
import type { MessageTypeDefinition } from '@grpc/proto-loader';

import type { ConnectorsCommunicationClient as _connectors_communication_package_ConnectorsCommunicationClient, ConnectorsCommunicationDefinition as _connectors_communication_package_ConnectorsCommunicationDefinition } from './connectors_communication_package/ConnectorsCommunication';

type SubtypeConstructor<Constructor extends new (...args: any) => any, Subtype> = {
  new(...args: ConstructorParameters<Constructor>): Subtype;
};

export interface ProtoGrpcType {
  connectors_communication_package: {
    ConnectorsCommunication: SubtypeConstructor<typeof grpc.Client, _connectors_communication_package_ConnectorsCommunicationClient> & { service: _connectors_communication_package_ConnectorsCommunicationDefinition }
    Empty: MessageTypeDefinition
    StreamRequest: MessageTypeDefinition
    StreamResponse: MessageTypeDefinition
  }
}

