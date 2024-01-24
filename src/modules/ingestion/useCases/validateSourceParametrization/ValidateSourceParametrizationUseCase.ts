import { inject, injectable } from 'tsyringe';

import { ISourceRepository } from '@modules/ingestion/repositories/ISourceRepository';
import { AppError } from '@shared/errors/AppError';

interface ValidationErrorItem {
  message: string; // Mensagem de erro específica para este item
  path: (string | number)[]; // Caminho do erro no objeto validado
  type: string; // Tipo de erro, como 'string.base', 'any.required', etc.
  context?: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Contexto adicional sobre o erro
    label?: string; // Rótulo do campo onde o erro ocorreu
    key?: string; // Chave do campo onde o erro ocorreu
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value?: any; // Valor que gerou o erro
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface ValidationError extends Error {
  name: string; // Nome do erro, normalmente 'ValidationError'
  message: string; // Mensagem de erro geral
  details: ValidationErrorItem[]; // Detalhes dos erros individuais
  annotate(): string; // Função para retornar uma string com a anotação do erro
}

@injectable()
class ValidateSourceParametrizationUseCase {
  constructor(
    @inject('SourceRepository') private repository: ISourceRepository,
  ) {}

  async execute() {
    const schema = this.repository.getSchema();

    // * Extrair apenas os key-values necessários das variáveis de ambiente
    const params: {
      [key: string]: string;
    } = {};

    const validKeys = Object.keys(schema.describe().keys);

    validKeys.forEach((key) => {
      if (process.env[key]) {
        params[key] = process.env[key]!;
      }
    });

    const { error } = schema.validate(params, { abortEarly: false });

    if (error) {
      const errorMessage = [] as string[];

      error.details.forEach((error: ValidationErrorItem) =>
        errorMessage.push(error.message),
      );

      throw new AppError(errorMessage.join(', '));
    }
  }
}

export { ValidateSourceParametrizationUseCase };
