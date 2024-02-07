import type { Address } from "viem";
import { callIsContract } from "../call/call";
import { SALT } from "../constants/constants";
import { addressesGetField } from "../common/addresses";
import { sendWallet } from "./send";
import { callRegistryAccount } from "../call/callRegistry";
import erc6551Registry from "@autoswarm/contracts/out/Erc6551Registry.sol/Erc6551Registry.json";

const sendRegistryCreateAccount = async (bzzChainId: number, nftChainId: number, nftCollection: Address, nftTokenId: bigint): Promise<Address> => {
  const tba = await callRegistryAccount(bzzChainId, nftChainId, nftCollection, nftTokenId);

  if (await callIsContract(bzzChainId, tba)) return tba;

  const erc6551RegistryAddress = addressesGetField(bzzChainId, "ERC6551Registry");
  const autoSwarmAccount = addressesGetField(bzzChainId, "AutoSwarmAccount");

  const [publicClient, walletClient, walletAddress] = await sendWallet(bzzChainId);

  const { request } = await publicClient.simulateContract({
    account: walletAddress,
    address: erc6551RegistryAddress,
    abi: erc6551Registry.abi,
    functionName: "createAccount",
    args: [autoSwarmAccount, SALT, BigInt(nftChainId), nftCollection, nftTokenId],
  });
  const hash = await walletClient.writeContract(request);
  await publicClient.waitForTransactionReceipt({ hash: hash });

  if (!(await callIsContract(bzzChainId, tba))) throw new Error("sendRegistryCreateAccount: Create failed");

  return tba;
};

// const swarmHash = ZERO_BYTES32;
// const nftSize = 0n;
// const bzzAmount = 0n;
// const data = encodeFunctionData({
//   abi: autoSwarmAccountAbi,
//   functionName: 'initialize',
//   args: [json.PostageStamp , swarmHash as Hex, nftSize, bzzAmount]
// });

export { sendRegistryCreateAccount };
