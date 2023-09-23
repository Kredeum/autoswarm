import 'viem/window';
import type { Address, Chain, Hex, PublicClient } from 'viem';
import { autoSwarmAbi, bzzTokenAbi } from '$lib/ts/abis';
import { readJson, readIsContract, readAccount, readLastPrice } from '$lib/ts/read';
import { DEFAULT_PRICE, ONE_MONTH, ONE_YEAR, SECONDS_PER_BLOCK } from './constants';
import { writeCreateAccount, writeWalletAddress, writeWalletClient } from './write';

///////////////////////////////////////////////////////////////////////////////////////////////////
// WRITE : onchain write functions via rpc, i.e. functions with walletClient
///////////////////////////////////////////////////////////////////////////////////////////////////

const _writeStampsTopUp = async (chain: Chain, publicClient: PublicClient, topUpAmount: bigint) => {
	const json = await readJson(publicClient);
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient);
	const autoSwarmAddress = await readAccount(publicClient);
	if (!('batchId' in json)) throw Error('No batchId in json');

	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: autoSwarmAddress,
		abi: autoSwarmAbi,
		functionName: 'stampsTopUp',
		args: [json.batchId as Hex, topUpAmount]
	});
	const hash = await walletClient.writeContract(request);
	await publicClient.waitForTransactionReceipt({ hash });
};

const _writeStampsBuy = async (chain: Chain, publicClient: PublicClient) => {
	const autoSwarmAddress = await readAccount(publicClient);
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient);
	const lastPrice = (await readLastPrice(publicClient)) || DEFAULT_PRICE;
	const buyTtl = (BigInt(ONE_MONTH) * lastPrice) / SECONDS_PER_BLOCK;
	const depth = 17;
	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: autoSwarmAddress,
		abi: autoSwarmAbi,
		functionName: 'stampsBuy',
		args: [buyTtl, depth]
	});  
	const hash = await walletClient.writeContract(request);
	await publicClient.waitForTransactionReceipt({ hash });
};

const writeStampsDeposit = async (chain: Chain, publicClient: PublicClient) => {
	const json = await readJson(publicClient);
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient);
	const autoSwarmAddress = await readAccount(publicClient);

	console.log('writeStampsDeposit ~ json.BzzToken:', json.BzzToken);
	console.log('writeStampsDeposit ~ autoSwarmAddress:', autoSwarmAddress);

	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: json.BzzToken as Address,
		abi: bzzTokenAbi,
		functionName: 'transfer',
		args: [autoSwarmAddress, 2n * 10n ** 16n]
	});
	const hash = await walletClient.writeContract(request);
	await publicClient.waitForTransactionReceipt({ hash });
};

const writeStampsWithdraw = async (chain: Chain, publicClient: PublicClient) => {
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient);
	const autoSwarmAddress = await readAccount(publicClient);
	console.log('writeStampsWithdraw');

	console.log('writeStampsWithdraw 1');
	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: autoSwarmAddress,
		abi: autoSwarmAbi,
		functionName: 'withdrawBzz'
	});
	console.log('writeStampsWithdraw 2', request);
	const hash = await walletClient.writeContract(request);
	console.log('writeStampsWithdraw', hash);
	await publicClient.waitForTransactionReceipt({ hash });
};


const writeStampsBuy = async (chain: Chain, publicClient: PublicClient) => {
	const autoSwarmAddress = await readAccount(publicClient);

	if (!(await readIsContract(publicClient, autoSwarmAddress))) {
		await writeCreateAccount(chain, publicClient);
	}

	await _writeStampsBuy(chain, publicClient);
};

const writeStampsTopUp = async (
	chain: Chain,
	publicClient: PublicClient,
	topUpttl = (BigInt(ONE_YEAR) * DEFAULT_PRICE) / SECONDS_PER_BLOCK
) => {
	const autoSwarmAddress = await readAccount(publicClient);

	if (!(await readIsContract(publicClient, autoSwarmAddress))) {
		await writeCreateAccount(chain, publicClient);
	}

	await _writeStampsTopUp(chain, publicClient, topUpttl);
};

export { writeStampsBuy, writeStampsTopUp, writeStampsWithdraw, writeStampsDeposit };
