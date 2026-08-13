import { createClient } from '@supabase/supabase-js'

// Next.js build time safety ke liye valid fallback values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nkuphmrkcifnuzldoan.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'dummy-key-for-build'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Firestore to Supabase Wrapper to satisfy TypeScript and allow easy migration
export const db = "supabase-db";

export const doc = (dbRef: any, table: string, id: string) => ({ table, id });
export const collection = (dbRef: any, table: string) => ({ table });

export const getDoc = async (ref: any) => {
  try {
    const { data, error } = await supabase.from(ref.table).select('*').eq('id', ref.id).single();
    return {
      exists: () => !!data && !error,
      data: () => data || {},
      id: ref.id
    };
  } catch (err) {
    console.error("Error in getDoc:", err);
    return {
      exists: () => false,
      data: () => ({}),
      id: ref.id
    };
  }
};

export const setDoc = async (ref: any, data: any, options?: { merge?: boolean }) => {
  try {
    const payload = { id: ref.id, ...data };
    await supabase.from(ref.table).upsert(payload);
  } catch (err) {
    console.error("Error in setDoc:", err);
  }
};

export const addDoc = async (ref: any, data: any) => {
  try {
    const { data: res, error } = await supabase.from(ref.table).insert(data).select().single();
    if (error) throw error;
    return { id: res?.id };
  } catch (err) {
    console.error("Error in addDoc:", err);
    return { id: null };
  }
};

export const deleteDoc = async (ref: any) => {
  try {
    await supabase.from(ref.table).delete().eq('id', ref.id);
  } catch (err) {
    console.error("Error in deleteDoc:", err);
  }
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
  try {
    let builder: any = supabase.from(q.ref.table).select('*');
    if (q.args) {
      for (const arg of q.args) {
        if (arg.type === 'where') {
          if (arg.op === '==') builder = builder.eq(arg.field, arg.value);
          if (arg.op === '>=') builder = builder.gte(arg.field, arg.value);
          if (arg.op === '<=') builder = builder.lte(arg.field, arg.value);
        }
        if (arg.type === 'orderBy') {
          builder = builder.order(arg.field, { ascending: arg.dir === 'asc' });
        }
      }
    }
    const { data, error } = await builder;
    if (error) throw error;

    const docs = (data || []).map((d: any) => ({
      id: d.id,
      data: () => d
    }));
    return { empty: docs.length === 0, docs };
  } catch (err) {
    console.error("Error in getDocs:", err);
    return { empty: true, docs: [] };
  }
};

export const onSnapshot = (refOrQuery: any, callback: any, onError?: any) => {
  const table = refOrQuery.table || refOrQuery.ref?.table;

  // Initial fetch
  if (refOrQuery.id) {
    getDoc(refOrQuery).then(callback).catch(onError);
  } else {
    getDocs(refOrQuery).then(callback).catch(onError);
  }

  // Realtime subscription setup
  const channel = supabase.channel(`public:${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
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

