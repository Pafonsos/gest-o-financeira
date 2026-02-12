import { describe, expect, it } from 'vitest';
import { getClienteSubtitulo, getClienteTitulo } from './clientDisplay';

describe('clientDisplay', () => {
  it('prioriza nomeEmpresa no titulo', () => {
    expect(
      getClienteTitulo({ nomeEmpresa: 'Empresa X', nomeResponsavel: 'Ana' })
    ).toBe('Empresa X');
  });

  it('usa nomeResponsavel quando nomeEmpresa nao existe', () => {
    expect(getClienteTitulo({ nomeResponsavel: 'Ana' })).toBe('Ana');
  });

  it('retorna fallback para titulo vazio', () => {
    expect(getClienteTitulo({})).toBe('Cliente');
  });

  it('gera subtitulo com responsavel', () => {
    expect(getClienteSubtitulo({ nomeResponsavel: 'Carlos' })).toBe(
      'Responsavel: Carlos'
    );
  });

  it('gera subtitulo com email sem responsavel', () => {
    expect(getClienteSubtitulo({ email: 'c@x.com' })).toBe('c@x.com');
  });
});
