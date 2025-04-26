'use strict';
const { Contract } = require('fabric-contract-api');

class EncryptedContract extends Contract {
  async store(ctx, key, encryptedValue) {
    const role = ctx.clientIdentity.getAttributeValue('role');
    if (role !== 'auditor') {
      throw new Error('Unauthorized: Only auditor can store data');
    }

    if (!key || !encryptedValue) {
      throw new Error('Key and encryptedValue are required');
    }

    await ctx.stub.putState(key, Buffer.from(encryptedValue));
    return `Stored key=${key}`;
  }

  async read(ctx, key) {
    const role = ctx.clientIdentity.getAttributeValue('role');
    if (role !== 'auditor') {
      throw new Error('Unauthorized: Only auditor can read data');
    }

    if (!key) throw new Error('Key is required');
    const data = await ctx.stub.getState(key);
    if (!data || data.length === 0) {
      throw new Error(`Key ${key} not found`);
    }
    return data.toString();
  }
}

module.exports = EncryptedContract;


module.exports = EncryptedContract;
