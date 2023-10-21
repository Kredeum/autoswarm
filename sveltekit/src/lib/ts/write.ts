import 'viem/window';
import {
	createWalletClient,
	type Address,
	type Chain,
	type WalletClient,
	type EIP1193Provider,
	custom,
	BaseError,
	ContractFunctionRevertedError,
	encodeFunctionData
} from 'viem';
import { autoSwarmAbi, bzzTokenAbi, erc6551RegistryAbi } from '$lib/ts/abis';
import {
	readJson,
	readChainId,
	readIsContract,
	readAccount,
	readLastTokenId,
	readPublicClient
} from '$lib/ts/read';
import { SALT } from './constants';
import { gnosis } from 'viem/chains';

///////////////////////////////////////////////////////////////////////////////////////////////////
// WRITE : onchain write functions via rpc, i.e. functions with walletClient
///////////////////////////////////////////////////////////////////////////////////////////////////

const _writeWindowEthereum = (): EIP1193Provider => {
	if (!window?.ethereum) {
		const message = 'Install Web3 extension like Rabby or Metamask';
		alert(message);
		throw new Error(message);
	}

	return window.ethereum;
};

const _writeWalletEthereum = (): WalletClient => {
	return createWalletClient({
		transport: custom(_writeWindowEthereum())
	});
};

const writeWalletAddress = async (
	walletClient = _writeWalletEthereum(),
	force = false,
	n = 0
): Promise<Address> => {
	return force
		? (await walletClient.requestAddresses())[n]
		: (await walletClient.getAddresses())[n];
};

const writeWalletClient = async (chain: Chain): Promise<WalletClient> => {
	const ethereum = _writeWindowEthereum();

	const walletClient = createWalletClient({
		chain,
		transport: custom(ethereum)
	});

	const chainId = await walletClient.getChainId();
	if (chain.id > 0 && chainId !== chain.id) {
		console.log('writeWalletClient switchChain', chainId, chain.id);
		await walletClient.switchChain({ id: chain.id });
	}

	return walletClient;
};

const writeCreateAccount = async (chain: Chain): Promise<Address> => {
	const autoSwarmAddress = await readAccount(chain);
	if (await readIsContract(chain, autoSwarmAddress)) return autoSwarmAddress;

	const chainId = await readChainId(chain);
	const json = await readJson(chain);
	const tokenId = await readLastTokenId(chain);

	const publicClient = await readPublicClient(chain);
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient, true);

	try {
		const data = encodeFunctionData({
			abi: autoSwarmAbi,
			functionName: 'initialize',
			args: [json.PostageStamp as Address]
		});

		const { request } = await publicClient.simulateContract({
			account: walletAddress,
			address: json.ERC6551Registry as Address,
			abi: erc6551RegistryAbi,
			functionName: 'createAccount',
			args: [
				json.AutoSwarmAccount as Address,
				BigInt(chainId),
				json.NFTCollection as Address,
				tokenId,
				SALT,
				data
			]
		});
		const hash = await walletClient.writeContract(request);
		await publicClient.waitForTransactionReceipt({ hash: hash });
	} catch (err) {
		if (err instanceof BaseError) {
			const revertError = err.walk((err) => err instanceof ContractFunctionRevertedError);
			if (revertError instanceof ContractFunctionRevertedError) {
				const errorName = revertError.data?.errorName ?? '';
				console.error('writeCreateAccount ~ errorName:', errorName);
			}
		}
	}

	if (!(await readIsContract(chain, autoSwarmAddress))) throw Error('Create failed');

	return autoSwarmAddress;
};

const writeApproveBzz = async (chain: Chain, bzzAmount: bigint) => {
	const json = await readJson(chain);

	const publicClient = await readPublicClient(chain);
	const walletClient = await writeWalletClient(chain);
	const walletAddress = await writeWalletAddress(walletClient, true);

	const { request } = await publicClient.simulateContract({
		account: walletAddress,
		address: json.BzzToken as Address,
		abi: bzzTokenAbi,
		functionName: 'approve',
		args: [json.PostageStamp as Address, bzzAmount]
	});

	const hash = await walletClient.writeContract(request);
	await publicClient.waitForTransactionReceipt({ hash });
};

export { writeCreateAccount, writeApproveBzz, writeWalletClient, writeWalletAddress };
