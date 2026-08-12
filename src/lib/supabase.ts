import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fake-supabase-url.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'fake-supabase-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Firestore to Supabase Wrapper to satisfy TypeScript and allow easy migration
export const db = "supabase-db";

export const doc = (dbRef: any, table: string, id: string) => ({ table, id });
export const collection = (dbRef: any, table: string) => ({ table });

export const getDoc = async (ref: any) => {
  const { data } = await supabase.from(ref.table).select('*').eq('id', ref.id).single();
  return {
    exists: () => !!data,
    data: () => data,
    id: ref.id
  };
};

export const setDoc = async (ref: any, data: any, options?: { merge: boolean }) => {
  const payload = { id: ref.id, ...data };
  await supabase.from(ref.table).upsert(payload);
};

export const addDoc = async (ref: any, data: any) => {
  const { data: res } = await supabase.from(ref.table).insert(data).select().single();
  return { id: res?.id };
};

export const deleteDoc = async (ref: any) => {
  await supabase.from(ref.table).delete().eq('id', ref.id);
};

export const query = (ref: any, ...args: any[]) => {
  return { ref, args };
};

export const where = (field: string, op: string, value: any) => {
  return { type: 'where', field, op, value };
};

export const orderBy = (field: string, dir: string) => {
  return { type: 'orderBy', field, dir };
};

export const getDocs = async (q: any) => {
  let builder: any = supabase.from(q.ref.table).select('*');
  for (const arg of q.args) {
    if (arg.type === 'where') {
      if (arg.op === '==') builder = builder.eq(arg.field, arg.value);
      if (arg.op === '>=') builder = builder.gte(arg.field, arg.value);
      if (arg.op === '<=') builder = builder.lte(arg.field, arg.value); // hack for '\uf8ff' string limits
    }
    if (arg.type === 'orderBy') {
      builder = builder.order(arg.field, { ascending: arg.dir === 'asc' });
    }
  }
  const { data } = await builder;
  const docs = (data || []).map((d: any) => ({
    id: d.id,
    data: () => d
  }));
  return { empty: docs.length === 0, docs };
};

export const onSnapshot = (refOrQuery: any, callback: any, onError?: any) => {
  const table = refOrQuery.table || refOrQuery.ref?.table;
  const filter = refOrQuery.id ? `id=eq.${refOrQuery.id}` : undefined;

  // Initial fetch to simulate onSnapshot behavior
  if (refOrQuery.id) {
    getDoc(refOrQuery).then(callback).catch(onError);
  } else {
    getDocs(refOrQuery).then(callback).catch(onError);
  }

  const channel = supabase.channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table, filter }, (payload: any) => {
      // Very naive implementation for real-time trigger
      if (refOrQuery.id) {
        getDoc(refOrQuery).then(callback).catch(onError);
      } else {
        getDocs(refOrQuery).then(callback).catch(onError);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
