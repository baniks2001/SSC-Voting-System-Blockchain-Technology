function serializeBigInt(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return obj.toString();
  }


  if (typeof obj === 'number' && (obj > Number.MAX_SAFE_INTEGER || obj < Number.MIN_SAFE_INTEGER)) {
    return obj.toString();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => serializeBigInt(item));
  }

  if (typeof obj === 'object') {
    // Handle special objects
    if (obj instanceof Map) {
      return Object.fromEntries(
        Array.from(obj.entries()).map(([k, v]) => [k, serializeBigInt(v)])
      );
    }
    if (obj instanceof Set) {
      return Array.from(obj).map(item => serializeBigInt(item));
    }
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    if (obj.type === 'BigNumber' || (obj.constructor && obj.constructor.name === 'BigNumber')) {
      return obj.toString();
    }


    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value !== 'function') {
        result[key] = serializeBigInt(value);
      }
    }
    return result;
  }

  return obj;
}


export function safeJSONStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    if (value instanceof Map) {
      return Object.fromEntries(value);
    }
    if (value instanceof Set) {
      return Array.from(value);
    }
    return value;
  });
}

export function safeJSONParse(str) {
  return JSON.parse(str);
}