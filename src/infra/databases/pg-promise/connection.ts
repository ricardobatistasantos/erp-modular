import pgPromise from 'pg-promise';

const pgp = pgPromise();

export enum ReplicType {
  MASTER = 'master',
  SLAVE = 'slave',
}

const replics = {
  master: {
    host: process.env.HOST_DATABASE,
    port: Number(process.env.PORT_DATABASE),
    database: process.env.DB,
    user: process.env.USER_DATABASE,
    password: process.env.PASSWORD_DATABASE,
  },
  slave: {},
};

const connections = {
  [ReplicType.MASTER]: <pgPromise.IMain>null,
  [ReplicType.SLAVE]: <pgPromise.IMain>null,
};

export function getConnection(replic: ReplicType = ReplicType.MASTER) {
  try {
    if (!connections[replic]) {
      connections[replic] = pgp(replics[replic]);
    }
    return connections[replic];
  } catch (error) {
    throw error
  }
}
