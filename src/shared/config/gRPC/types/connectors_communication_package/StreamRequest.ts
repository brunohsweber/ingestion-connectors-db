// Original file: src/shared/infra/gRPC/proto/connectors_communication.proto


export interface StreamRequest {
  'chunk'?: (Buffer | Uint8Array | string);
}

export interface StreamRequest__Output {
  'chunk': (Buffer);
}
