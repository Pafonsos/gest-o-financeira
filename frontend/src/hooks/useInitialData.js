import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { mapClientFromDb, mapClientToDb, mapDespesaFromDb, mapDespesaToDb } from '../utils/clientDataMappers';

export const useInitialData = ({ setClientes, setDespesas, createSignedContratoUrl }) => {
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: true });

        if (clientesError) throw clientesError;

        let clientesRows = clientesData || [];

        if (clientesRows.length === 0) {
          const localRaw = localStorage.getItem('financial-manager-clientes');
          if (localRaw) {
            try {
              const localList = JSON.parse(localRaw) || [];
              const rowsToInsert = localList.map((client) => {
                const isNumericId = typeof client.id === 'number' && Number.isFinite(client.id);
                const pipefyCardId =
                  client.pipefyCardId ||
                  (typeof client.id === 'string' ? client.id : null);

                return {
                  ...mapClientToDb({
                    ...client,
                    id: undefined,
                    legacyId: isNumericId ? client.id : null,
                    pipefyCardId: pipefyCardId || null
                  })
                };
              });

              if (rowsToInsert.length > 0) {
                const { data: inserted, error: insertError } = await supabase
                  .from('clientes')
                  .insert(rowsToInsert)
                  .select('*');

                if (insertError) throw insertError;
                clientesRows = inserted || [];
                localStorage.removeItem('financial-manager-clientes');
              }
            } catch (error) {
              console.error('Erro ao migrar clientes do localStorage:', error);
            }
          }
        }

        if (!cancelled) {
          const mapped = (clientesRows || []).map(mapClientFromDb);
          try {
            const enriched = await Promise.all(mapped.map(async (cliente) => {
              if (cliente.contratoPath) {
                try {
                  const signedUrl = await createSignedContratoUrl(cliente.contratoPath);
                  return { ...cliente, contratoDataUrl: signedUrl };
                } catch {
                  return cliente;
                }
              }
              return cliente;
            }));

            if (!cancelled) setClientes(enriched);
          } catch {
            setClientes(mapped);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar clientes do Supabase:', error);
      }

      try {
        const { data: despesasData, error: despesasError } = await supabase
          .from('despesas')
          .select('*')
          .order('created_at', { ascending: true });

        if (despesasError) throw despesasError;

        let despesasRows = despesasData || [];

        if (despesasRows.length === 0) {
          const localRaw = localStorage.getItem('contas-a-pagar');
          if (localRaw) {
            try {
              const localList = JSON.parse(localRaw) || [];
              const rowsToInsert = localList.map((despesa) => ({
                ...mapDespesaToDb({ ...despesa, id: undefined })
              }));

              if (rowsToInsert.length > 0) {
                const { data: inserted, error: insertError } = await supabase
                  .from('despesas')
                  .insert(rowsToInsert)
                  .select('*');

                if (insertError) throw insertError;
                despesasRows = inserted || [];
                localStorage.removeItem('contas-a-pagar');
              }
            } catch (error) {
              console.error('Erro ao migrar despesas do localStorage:', error);
            }
          }
        }

        if (!cancelled) {
          setDespesas((despesasRows || []).map(mapDespesaFromDb));
        }
      } catch (error) {
        console.error('Erro ao carregar despesas do Supabase:', error);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [createSignedContratoUrl, setClientes, setDespesas]);
};
