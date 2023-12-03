const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const SALT = '0x0000000000000000000000000000000000000000000000000293008712982323';

const METADATA_JSON = 'metadata.json';
const IMAGE_JPEG = 'image.jpeg';

const SWARM_DEFAULT_API = 'http://127.0.0.1:1633';
const SWARM_DEFAULT_BATCHID = ZERO_BYTES32;

const SWARM_GATEWAY = 'https://api.gateway.ethswarm.org/bzz';
const IPFS_GATEWAY = 'https://ipfs.io/ipfs';
const ARWEAVE_GATEWAY = 'https://arweave.net';

const BZZ_DECIMALS = 16;

const ONE_HOUR = 3600;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;
const ONE_MONTH = ONE_DAY * 30;
const ONE_YEAR = ONE_DAY * 365;

const STAMP_PERIOD = ONE_YEAR;
const STAMP_UNIT = 1024n ** 2n; // 1 Mo
const STAMP_UNIT_PRICE = 10n ** 15n; // 0.1 Bzz

const BATCH_UNIT_PRICE = 10n ** 17n; // 10 Bzz

const BUCKET_DEPTH = 16;
const BUCKET_SIZE = 4096;

const DEFAULT_PRICE = 24000n;
const SECONDS_PER_BLOCK = 5;

const DIVISION_BY_ZERO = '?????';
const UNDEFINED_ADDRESS = '0x****************************************';
const UNDEFINED_DATA = '*****';

export {
	SALT,
	ONE_HOUR,
	ONE_DAY,
	ONE_WEEK,
	ONE_MONTH,
	ONE_YEAR,
	BUCKET_DEPTH,
	BUCKET_SIZE,
	BZZ_DECIMALS,
	DEFAULT_PRICE,
	SECONDS_PER_BLOCK,
	DIVISION_BY_ZERO,
	UNDEFINED_ADDRESS,
	UNDEFINED_DATA,
	ZERO_BYTES32,
	SWARM_DEFAULT_API,
	SWARM_DEFAULT_BATCHID,
	SWARM_GATEWAY,
	IPFS_GATEWAY,
	ARWEAVE_GATEWAY,
	STAMP_PERIOD,
	STAMP_UNIT,
	STAMP_UNIT_PRICE,
	BATCH_UNIT_PRICE,
	METADATA_JSON,
	IMAGE_JPEG
};
