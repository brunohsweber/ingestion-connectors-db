// Original file: src/shared/infra/gRPC/proto/connectors_communication.proto

import type * as grpc from '@grpc/grpc-js'
import type { MethodDefinition } from '@grpc/proto-loader'
import type { Empty as _connectors_communication_package_Empty, Empty__Output as _connectors_communication_package_Empty__Output } from '../connectors_communication_package/Empty';
import type { StreamRequest as _connectors_communication_package_StreamRequest, StreamRequest__Output as _connectors_communication_package_StreamRequest__Output } from '../connectors_communication_package/StreamRequest';
import type { StreamResponse as _connectors_communication_package_StreamResponse, StreamResponse__Output as _connectors_communication_package_StreamResponse__Output } from '../connectors_communication_package/StreamResponse';

export interface ConnectorsCommunicationClient extends grpc.Client {
  closeConnection(argument: _connectors_communication_package_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, metadata: grpc.Metadata, options: grpc.CallOptions, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, metadata: grpc.Metadata, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, options: grpc.CallOptions, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  closeConnection(argument: _connectors_communication_package_Empty, callback: grpc.requestCallback<_connectors_communication_package_Empty__Output>): grpc.ClientUnaryCall;
  
  stream(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_connectors_communication_package_StreamRequest, _connectors_communication_package_StreamResponse__Output>;
  stream(options?: grpc.CallOptions): grpc.ClientDuplexStream<_connectors_communication_package_StreamRequest, _connectors_communication_package_StreamResponse__Output>;
  stream(metadata: grpc.Metadata, options?: grpc.CallOptions): grpc.ClientDuplexStream<_connectors_communication_package_StreamRequest, _connectors_communication_package_StreamResponse__Output>;
  stream(options?: grpc.CallOptions): grpc.ClientDuplexStream<_connectors_communication_package_StreamRequest, _connectors_communication_package_StreamResponse__Output>;
  
}

export interface ConnectorsCommunicationHandlers extends grpc.UntypedServiceImplementation {
  closeConnection: grpc.handleUnaryCall<_connectors_communication_package_Empty__Output, _connectors_communication_package_Empty>;
  
  stream: grpc.handleBidiStreamingCall<_connectors_communication_package_StreamRequest__Output, _connectors_communication_package_StreamResponse>;
  
}

export interface ConnectorsCommunicationDefinition extends grpc.ServiceDefinition {
  closeConnection: MethodDefinition<_connectors_communication_package_Empty, _connectors_communication_package_Empty, _connectors_communication_package_Empty__Output, _connectors_communication_package_Empty__Output>
  stream: MethodDefinition<_connectors_communication_package_StreamRequest, _connectors_communication_package_StreamResponse, _connectors_communication_package_StreamRequest__Output, _connectors_communication_package_StreamResponse__Output>
}
