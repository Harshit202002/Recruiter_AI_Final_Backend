import mongoose from 'mongoose';

const connections = {};

export const getTenantDb = async (dbName) => {
  if (!dbName) throw new Error('No dbName provided');
  if (connections[dbName]) {
    return connections[dbName];
  }
  const uri = `${process.env.MONGO_URI_BASE}/${dbName}`;
  const conn = await mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  connections[dbName] = conn;
  return conn;
};
